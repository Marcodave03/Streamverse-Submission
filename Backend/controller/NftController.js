import {
  Client,
  PrivateKey,
  Hbar,
  TransferTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";

// In-memory NFT marketplace
const nftMarket = [];

const NftController = {
  // 1. MINT NFT (user-owned)
  async mintNFT(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = decoded?.id;

      const user = await User.findByPk(user_id);
      if (!user || !user.hederaAccountId || !user.hederaPrivateKey) {
        return res
          .status(403)
          .json({ success: false, message: "User Hedera info missing" });
      }

      const { name, symbol, cid, model, maxSupply } = req.body;
      if (!name || !symbol || !cid || !maxSupply) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const privateKey = PrivateKey.fromString(user.hederaPrivateKey);
      const client = Client.forTestnet().setOperator(
        user.hederaAccountId,
        privateKey
      );

      // Create NFT
      const createTx = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(parseInt(maxSupply))
        .setTreasuryAccountId(user.hederaAccountId)
        .setAdminKey(privateKey.publicKey)
        .setSupplyKey(privateKey.publicKey)
        .freezeWith(client)
        .sign(privateKey);

      const createSubmit = await createTx.execute(client);
      const tokenId = (await createSubmit.getReceipt(client)).tokenId;

      // ✅ Proper JSON metadata for NFT image
      const metadataObject = {
        name,
        description: `${name} NFT on Conversia`,
        image: `ipfs://${cid}`,
        model,
      };
      const encodedMetadata = Buffer.from(cid);

      const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([encodedMetadata])
        .freezeWith(client)
        .sign(privateKey);

      const mintSubmit = await mintTx.execute(client);
      const mintReceipt = await mintSubmit.getReceipt(client);

      return res.status(200).json({
        success: true,
        message: "✅ NFT minted successfully",
        tokenId: tokenId.toString(),
        serial: mintReceipt.serials[0]?.toString(),
        metadata: metadataObject,
      });
    } catch (err) {
      console.error("❌ Mint error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  //   async mintNFT(req, res) {
  //     try {
  //       const authHeader = req.headers.authorization;
  //       if (!authHeader?.startsWith("Bearer ")) {
  //         return res
  //           .status(401)
  //           .json({ success: false, message: "Unauthorized" });
  //       }

  //       const token = authHeader.split(" ")[1];
  //       const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //       const user_id = decoded?.id;

  //       const user = await User.findByPk(user_id);
  //       if (!user || !user.hederaAccountId || !user.hederaPrivateKey) {
  //         return res
  //           .status(403)
  //           .json({ success: false, message: "User Hedera info missing" });
  //       }

  //       const { name, symbol, cid, maxSupply } = req.body;
  //       if (!name || !symbol || !cid || !maxSupply) {
  //         return res
  //           .status(400)
  //           .json({ success: false, message: "Missing required fields" });
  //       }

  //       const client = Client.forTestnet().setOperator(
  //         user.hederaAccountId,
  //         PrivateKey.fromString(user.hederaPrivateKey)
  //       );

  //       const createTx = await new TokenCreateTransaction()
  //         .setTokenName(name)
  //         .setTokenSymbol(symbol)
  //         .setTokenType(TokenType.NonFungibleUnique)
  //         .setSupplyType(TokenSupplyType.Finite)
  //         .setMaxSupply(parseInt(maxSupply))
  //         .setTreasuryAccountId(user.hederaAccountId)
  //         .setAdminKey(PrivateKey.fromString(user.hederaPrivateKey).publicKey)
  //         .setSupplyKey(PrivateKey.fromString(user.hederaPrivateKey).publicKey)
  //         .freezeWith(client)
  //         .sign(PrivateKey.fromString(user.hederaPrivateKey));

  //       const createSubmit = await createTx.execute(client);
  //       const tokenId = (await createSubmit.getReceipt(client)).tokenId;

  //       const metadata = `ipfs://${cid}`;
  //       const mintTx = await new TokenMintTransaction()
  //         .setTokenId(tokenId)
  //         .setMetadata([Buffer.from(metadata)])
  //         .freezeWith(client)
  //         .sign(PrivateKey.fromString(user.hederaPrivateKey));

  //       const mintSubmit = await mintTx.execute(client);
  //       const mintReceipt = await mintSubmit.getReceipt(client);

  //       return res.status(200).json({
  //         success: true,
  //         message: "✅ NFT minted successfully",
  //         tokenId: tokenId.toString(),
  //         serial: mintReceipt.serials[0]?.toString(),
  //         metadata,
  //       });
  //     } catch (err) {
  //       console.error("❌ Mint error:", err);
  //       return res.status(500).json({ success: false, error: err.message });
  //     }
  //   },

  // 2. SELL NFT (list for sale)
  async sellNFT(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = decoded?.id;

      const { tokenId, serialNumber, priceHbar } = req.body;
      if (!tokenId || serialNumber === undefined || !priceHbar) {
        return res
          .status(400)
          .json({ success: false, message: "Missing fields" });
      }

      const seller = await User.findByPk(user_id);
      if (!seller || !seller.hederaAccountId) {
        return res
          .status(404)
          .json({ success: false, message: "Seller not found" });
      }

      nftMarket.push({
        tokenId,
        serialNumber: parseInt(serialNumber), // ✅ force to number
        price: new Hbar(priceHbar),
        sellerId: seller.user_id,
        hederaAccountId: seller.hederaAccountId,
      });

      return res.status(200).json({
        success: true,
        message: "✅ NFT listed for sale",
        listing: {
          tokenId,
          serialNumber,
          price: priceHbar,
          seller: seller.hederaAccountId,
        },
      });
    } catch (err) {
      console.error("❌ Sell error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. BUY NFT
  async buyNFT(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = decoded?.id;

      const { tokenId, serialNumber } = req.body;
      if (!tokenId || serialNumber === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tokenId or serialNumber" });
      }

      const buyer = await User.findByPk(user_id);
      if (!buyer || !buyer.hederaAccountId || !buyer.hederaPrivateKey) {
        return res
          .status(403)
          .json({ success: false, message: "Buyer not valid or missing keys" });
      }

      const nft = nftMarket.find(
        (item) =>
          item.tokenId === tokenId && item.serialNumber === Number(serialNumber) // ✅ force to number
      );

      if (!nft) {
        return res
          .status(404)
          .json({ success: false, message: "NFT not listed for sale" });
      }

      const seller = await User.findOne({ where: { user_id: nft.sellerId } });
      if (!seller || !seller.hederaPrivateKey) {
        return res
          .status(403)
          .json({ success: false, message: "Seller not valid or missing key" });
      }

      const buyerId = buyer.hederaAccountId;
      const buyerKey = PrivateKey.fromString(buyer.hederaPrivateKey);
      const sellerId = seller.hederaAccountId;
      const sellerKey = PrivateKey.fromString(seller.hederaPrivateKey);

      const client = Client.forTestnet().setOperator(buyerId, buyerKey);

      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(buyerId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(buyerKey);

      const associateSubmit = await associateTx.execute(client);
      const associateReceipt = await associateSubmit.getReceipt(client);

      // Optional: check if status is success
      if (associateReceipt.status.toString() !== "SUCCESS") {
        return res
          .status(500)
          .json({ success: false, message: "Token association failed" });
      }

      const transferTx = await new TransferTransaction()
        .addHbarTransfer(buyerId, nft.price.negated()) // Buyer pays
        .addHbarTransfer(sellerId, nft.price) // Seller receives
        .addNftTransfer(tokenId, serialNumber, sellerId, buyerId) // NFT transfer
        .freezeWith(client);

      const signedBySeller = await transferTx.sign(sellerKey);
      const signedByBuyer = await signedBySeller.sign(buyerKey);

      const txResult = await signedByBuyer.execute(client);
      const receipt = await txResult.getReceipt(client);

      // Remove NFT from market
      nftMarket.splice(nftMarket.indexOf(nft), 1);

      return res.status(200).json({
        success: true,
        message: "✅ NFT purchased",
        transactionStatus: receipt.status.toString(),
      });
    } catch (err) {
      console.error("❌ Buy error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. VIEW NFTs owned
  async listOwnedNFTs(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authorization token missing or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: "Hedera accountId missing in JWT",
        });
      }

      const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts`;
      const { data } = await axios.get(url);

      if (!data?.nfts || data.nfts.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No NFTs found for this account",
          nfts: [],
        });
      }

      const nfts = data.nfts.map((nft) => ({
        tokenId: nft.token_id,
        serialNumber: nft.serial_number,
        metadata:
          nft.metadata && nft.metadata !== ""
            ? Buffer.from(nft.metadata, "base64").toString("utf-8")
            : null,
      }));

      return res.status(200).json({
        success: true,
        count: nfts.length,
        nfts,
      });
    } catch (err) {
      console.error("❌ Error fetching NFTs:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch owned NFTs",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // 5. LIST all NFTs for sale
  async listNFTsForSale(_, res) {
    try {
      const listings = nftMarket.map((nft) => ({
        tokenId: nft.tokenId,
        serialNumber: nft.serialNumber,
        price: nft.price.toString(),
        seller: nft.hederaAccountId,
      }));

      return res.status(200).json({
        success: true,
        count: listings.length,
        listings,
      });
    } catch (err) {
      console.error("❌ Listing fetch failed:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. TRANSFER NFT to another user
  async sendNFT(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = decoded?.id;

      const { tokenId, serialNumber, recipientAccountId } = req.body;

      if (!tokenId || !serialNumber || !recipientAccountId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing fields" });
      }

      const sender = await User.findByPk(user_id);
      if (!sender || !sender.hederaPrivateKey || !sender.hederaAccountId) {
        return res
          .status(403)
          .json({ success: false, message: "Sender not valid" });
      }

      const senderId = sender.hederaAccountId;
      const senderKey = PrivateKey.fromString(sender.hederaPrivateKey);

      const client = Client.forTestnet().setOperator(senderId, senderKey);

      // Associate token to recipient if needed
      try {
        await new TokenAssociateTransaction()
          .setAccountId(recipientAccountId)
          .setTokenIds([tokenId])
          .freezeWith(client)
          .sign(PrivateKey.fromString(sender.hederaPrivateKey)) // Optional: recipient key if stored
          .execute(client);
      } catch (err) {
        // Ignore association failure (it might already be associated)
        console.log("Token may already be associated:", err.message);
      }

      // Transfer NFT
      const transferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, serialNumber, senderId, recipientAccountId)
        .freezeWith(client)
        .sign(senderKey);

      const txResult = await transferTx.execute(client);
      const receipt = await txResult.getReceipt(client);

      return res.status(200).json({
        success: true,
        message: "✅ NFT sent successfully",
        transactionStatus: receipt.status.toString(),
      });
    } catch (err) {
      console.error("❌ Send error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

export default NftController;
