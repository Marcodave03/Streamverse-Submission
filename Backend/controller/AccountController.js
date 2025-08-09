import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../models/User.js";
import {
  Client,
  PrivateKey,
  PublicKey,
  AccountBalanceQuery,
} from "@hashgraph/sdk";

dotenv.config();

const client = Client.forTestnet();

const validateHederaAccountId = (accountId) => {
  const hederaAccountRegex = /^\d+\.\d+\.\d+$/;
  return hederaAccountRegex.test(accountId);
};

const AccountController = {
  async loginOrRegister(req, res) {
    console.log("📥 LoginOrRegister endpoint called");
    console.log("Request body:", req.body);

    try {
      const { accountId, publicKey, privateKey } = req.body;

      if (!accountId || !publicKey || !privateKey) {
        console.log("❌ Missing required fields");
        return res.status(400).json({
          success: false,
          message: "Please provide accountId and publicKey and PrivateKey",
          required: ["accountId", "publicKey", "privateKey"],
        });
      }

      // Validate Hedera Account ID format
      if (!validateHederaAccountId(accountId)) {
        console.log("❌ Invalid Hedera Account ID format:", accountId);
        return res.status(400).json({
          success: false,
          message: "Invalid Hedera Account ID format",
          expected: "Format: 0.0.123456",
        });
      }

      console.log("🔍 Finding user...");
      let user = await User.findOne({
        where: { hederaAccountId: accountId },
      });

      // If user doesn't exist, create new user (auto-register)
      if (!user) {
        console.log("👤 User not found, creating new user...");

        // Generate a default username (optional, bisa juga null)
        const defaultUsername = `user_${accountId.replace(/\./g, "_")}`;

        user = await User.create({
          hederaAccountId: accountId,
          hederaPublicKey: publicKey,
          hederaPrivateKey: privateKey,
          username: defaultUsername, // Auto-generated, user can change later
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log("✅ New user created:", user.id);
      } else {
        console.log("✅ Existing user found:", user.id);

        // Optional: Update public key if it's different
        if (user.hederaPublicKey !== publicKey) {
          await user.update({
            hederaPublicKey: publicKey,
            updated_at: new Date(),
          });
          console.log("🔄 Public key updated");
        }
      }

      // Create JWT token with user ID
      const token = jwt.sign(
        {
          id: user.user_id,
          accountId: user.hederaAccountId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log("✅ Authentication successful:", user.id);

      return res.status(200).json({
        success: true,
        message:
          user.created_at.getTime() === user.updated_at.getTime()
            ? "User registered and logged in successfully"
            : "User logged in successfully",
        token,
        user: {
          id: user.id,
          accountId: user.hederaAccountId,
          username: user.username,
          created_at: user.created_at,
        },
        isNewUser: user.created_at.getTime() === user.updated_at.getTime(),
      });
    } catch (error) {
      console.error("❌ LoginOrRegister error:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((e) => ({
            field: e.path,
            message: e.message,
          })),
        });
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "Account ID already exists with different data",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async showUserBalance(req, res) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];

      // Verify and decode JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔍 Decoded token:", decoded);

      // Check if user ID exists in token
      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      // Find user by ID from token
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      console.log("👤 User found:", user.hederaAccountId);

      // Get account balance from Hedera
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(user.hederaAccountId)
        .execute(client);

      console.log("💰 Balance fetched:", accountBalance.hbars.toString());

      return res.status(200).json({
        success: true,
        balance: accountBalance.hbars.toString(),
        user: {
          id: user.id,
          accountId: user.hederaAccountId,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching balance:", error);

      // Handle JWT errors specifically
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Authorization header missing or invalid" });
      }

      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET);

      // On frontend, you should clear localStorage: localStorage.removeItem("jwt")

      return res
        .status(200)
        .json({ message: "Logout successful (client-side)" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }

      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async updateProfile(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authorization header missing or invalid",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const { username, bio, profile_picture } = req.body;

      // Optional: validate input fields if needed
      if (username && typeof username !== "string") {
        return res.status(400).json({ success: false, message: "Invalid username" });
      }

      if (bio && typeof bio !== "string") {
        return res.status(400).json({ success: false, message: "Invalid bio" });
      }

      if (profile_picture && typeof profile_picture !== "string") {
        return res.status(400).json({ success: false, message: "Invalid profile picture" });
      }

      // Update only provided fields
      if (username) user.username = username.trim();
      if (bio) user.bio = bio.trim();
      if (profile_picture) user.profile_picture = profile_picture.trim();
      user.updated_at = new Date();

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user.user_id,
          username: user.username,
          bio: user.bio,
          profile_picture: user.profile_picture,
          accountId: user.hederaAccountId,
        },
      });
    } catch (error) {
      console.error("❌ Update profile error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  async getAccount(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token required" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.id, {
        attributes: ["username", "bio", "profile_picture", "hederaAccountId"],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 💰 Get Hedera balance
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(user.hederaAccountId)
        .execute(client);

      const balance = accountBalance.hbars.toString();

      // 📦 Final response
      return res.status(200).json({
        success: true,
        user: {
          username: user.username,
          bio: user.bio,
          profile_picture: user.profile_picture,
          balance,
        },
      });
    } catch (error) {
      console.error("❌ Get account error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    console.log("📥 GetAllUsers endpoint called");

    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (search) {
        whereClause = {
          username: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        attributes: { exclude: ["password", "hederaPrivateKey"] },
      });

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: {
          users: users.map((user) => ({
            id: user.id,
            username: user.username,
            hederaAccountId: user.hederaAccountId,
            created_at: user.created_at,
          })),
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_users: count,
            per_page: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error in GetAllUsers:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

export default AccountController;
