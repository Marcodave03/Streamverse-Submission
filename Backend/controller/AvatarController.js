import Avatar from "../models/Avatar.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const AvatarController = {
  async createAvatar(req, res) {
    try {
      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user_id from token (not from params)
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { model_id, chat_id } = req.body;

      if (!model_id || !chat_id) {
        return res.status(400).json({
          success: false,
          message: "Please provide model_id and chat_id",
        });
      }

      // Check if user exists
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const avatar = await Avatar.create({ user_id, model_id, chat_id });

      res.status(201).json({
        success: true,
        message: "Avatar created successfully",
        avatar: {
          avatar_id: avatar.avatar_id,
          model_id: avatar.model_id,
          chat_id: avatar.chat_id,
          user_id: avatar.user_id,
          createdAt: avatar.createdAt,
          updatedAt: avatar.updatedAt,
        },
      });
    } catch (error) {
      console.error("❌ Create avatar error:", error);

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

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getAvatars(req, res) {
    try {
      // Extract and verify JWT token
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

      const avatars = await Avatar.findAll({
        include: User,
        attributes: [
          "avatar_id",
          "model_id",
          "chat_id",
          "createdAt",
          "updatedAt",
          "user_id",
        ],
      });

      res.status(200).json({
        success: true,
        avatars: avatars,
      });
    } catch (error) {
      console.error("❌ Get avatars error:", error);

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

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getAvatarsByUser(req, res) {
    try {
      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user_id from token (not from params)
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      // Check if user exists
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Fetch avatars for that user
      const avatars = await Avatar.findAll({
        where: { user_id },
        attributes: [
          "avatar_id",
          "model_id",
          "chat_id",
          "createdAt",
          "updatedAt",
          "user_id",
        ],
      });

      res.status(200).json({
        success: true,
        user: {
          user_id: user.user_id,
          username: user.username,
          hederaAccountId: user.hederaAccountId,
        },
        avatars: avatars,
      });
    } catch (error) {
      console.error("❌ Get avatars by user error:", error);

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

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getAvatarById(req, res) {
    try {
      // Extract and verify JWT token
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

      const { id } = req.params;
      const avatar = await Avatar.findByPk(id, {
        include: User,
        attributes: [
          "avatar_id",
          "model_id",
          "chat_id",
          "createdAt",
          "updatedAt",
          "user_id",
        ],
      });

      if (!avatar) {
        return res.status(404).json({
          success: false,
          message: "Avatar not found",
        });
      }

      // Check if avatar belongs to the authenticated user
      if (avatar.user_id !== decoded.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied - not your avatar",
        });
      }

      res.status(200).json({
        success: true,
        avatar: avatar,
      });
    } catch (error) {
      console.error("❌ Get avatar by ID error:", error);

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

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },
};

export default AvatarController;
