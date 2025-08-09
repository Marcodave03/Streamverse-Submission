import Background from "../models/Background.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const BackgroundController = {
  async createBackground(req, res) {
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

      const { image_id } = req.body;

      if (!image_id) {
        return res.status(400).json({
          success: false,
          message: "Please provide image_id",
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

      const background = await Background.create({ user_id, image_id });

      res.status(201).json({
        success: true,
        message: "Background created successfully",
        background: {
          background_id: background.background_id,
          image_id: background.image_id,
          user_id: background.user_id,
          createdAt: background.createdAt,
          updatedAt: background.updatedAt,
        },
      });
    } catch (error) {
      console.error("❌ Create background error:", error);

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

  async getAllBackgrounds(req, res) {
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

      const backgrounds = await Background.findAll({
        include: User,
        attributes: [
          "background_id",
          "image_id",
          "user_id",
          "createdAt",
          "updatedAt",
        ],
      });

      res.status(200).json({
        success: true,
        backgrounds: backgrounds,
      });
    } catch (error) {
      console.error("❌ Get backgrounds error:", error);

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

  async getBackgroundsByUser(req, res) {
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

      // Fetch backgrounds for that user
      const backgrounds = await Background.findAll({
        where: { user_id },
        attributes: [
          "background_id",
          "image_id",
          "user_id",
          "createdAt",
          "updatedAt",
        ],
      });

      res.status(200).json({
        success: true,
        user: {
          user_id: user.user_id,
          username: user.username,
          hederaAccountId: user.hederaAccountId,
        },
        backgrounds: backgrounds,
      });
    } catch (error) {
      console.error("❌ Get backgrounds by user error:", error);

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

  async getBackgroundById(req, res) {
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
      const background = await Background.findByPk(id, {
        include: User,
        attributes: [
          "background_id",
          "image_id",
          "user_id",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!background) {
        return res.status(404).json({
          success: false,
          message: "Background not found",
        });
      }

      // Check if background belongs to the authenticated user
      if (background.user_id !== decoded.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied - not your background",
        });
      }

      res.status(200).json({
        success: true,
        background: background,
      });
    } catch (error) {
      console.error("❌ Get background by ID error:", error);

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

export default BackgroundController;
