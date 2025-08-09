import {
  Client,
  TransferTransaction,
  Hbar,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import User from "../models/User.js";
import Streams from "../models/Stream.js";
import Donations from "../models/Donation.js";
import jwt from "jsonwebtoken";

const DonationController = {
  async donateToStreamer(req, res) {
    try {
      // 🔐 Extract JWT
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = decoded.id;

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { amount, senderAccountId, streamId } = req.body;
      if (!amount || !senderAccountId || !streamId) {
        return res.status(400).json({
          success: false,
          message: "Sender account ID, amount, and stream ID are required.",
        });
      }

      // ✅ Find authenticated user
      const authenticatedUser = await User.findByPk(user_id);
      if (!authenticatedUser) {
        return res.status(404).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      if (authenticatedUser.hederaAccountId !== senderAccountId) {
        return res.status(403).json({
          success: false,
          message: "You can only donate from your own account",
        });
      }

      // ✅ Fetch Stream and its owner
      const stream = await Streams.findOne({
        where: { stream_url: streamId },
        include: [{ model: User, as: "user" }],
      });

      if (!stream || !stream.user) {
        return res.status(404).json({
          success: false,
          message: "Stream or stream owner not found",
        });
      }

      const receiverAccountId = stream.user.hederaAccountId;

      // ✅ Fetch sender user from DB
      const sender = await User.findOne({
        where: { hederaAccountId: senderAccountId },
      });

      if (!sender || !sender.hederaPrivateKey) {
        return res.status(404).json({
          success: false,
          message: "Sender not found or missing private key",
        });
      }

      // ✅ Hedera: Check balance
      const client = Client.forTestnet().setOperator(senderAccountId, sender.hederaPrivateKey);
      const balanceQuery = await new AccountBalanceQuery()
        .setAccountId(senderAccountId)
        .execute(client);

      const senderBalanceTinybar = balanceQuery.hbars.toTinybars().toNumber();
      const amountTinybar = new Hbar(amount).toTinybars().toNumber();

      if (senderBalanceTinybar < amountTinybar) {
        return res.status(400).json({
          success: false,
          message: "Insufficient HBAR balance to complete the donation.",
        });
      }

      // ✅ Hedera: Execute transfer
      const transaction = new TransferTransaction()
        .addHbarTransfer(senderAccountId, new Hbar(-amount))
        .addHbarTransfer(receiverAccountId, new Hbar(amount))
        .freezeWith(client);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      console.log("⚠️ Sender object:", sender);
      console.log("⚠️ Stream.user object:", stream.user);
      console.log("⚠️ Donation Params:", {
        sender_id: sender?.user_id,
        receiver_id: stream?.user?.user_id,
        stream_id: stream?.id,
        amount,
      });

      // ✅ Record donation
      const donation = await Donations.create({
        sender_id: sender.user_id,
        receiver_id: stream.user.user_id,
        stream_id: stream.id,
        amount,
        timestamp: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Donation successful",
        transactionStatus: receipt.status.toString(),
        donation: {
          donation_id: donation.id,
          sender_id: donation.sender_id,
          receiver_id: donation.receiver_id,
          stream_id: donation.stream_id,
          amount: donation.amount,
          timestamp: donation.timestamp,
        },
      });
    } catch (error) {
      console.error("❌ Error during donation:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  async getReceiverAccountId(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { roomId } = req.params;
      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
      }

      const stream = await Streams.findOne({
        where: { topic_id: roomId },
        include: [{ model: User, as: "user" }],
      });

      if (!stream || !stream.user) {
        return res.status(404).json({
          success: false,
          message: "Stream or user not found",
        });
      }

      const receiverAccountId = stream.user.hederaAccountId;
      return res.status(200).json({ receiverAccountId });
    } catch (error) {
      console.error("Error fetching receiver account ID:", error);
      return res.status(500).json({ error: "Failed to fetch receiver account ID." });
    }
  },
};

export default DonationController;
