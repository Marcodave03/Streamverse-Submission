import { Server } from "socket.io";
import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Op, Sequelize } from "sequelize";

import Streams from "../models/Stream.js";
import User from "../models/User.js";
import Follower from "../models/Follower.js";

dotenv.config();

const client = Client.forTestnet();
// client.setOperator(
//   process.env.HEDERA_ACCOUNT_ID,
//   process.env.HEDERA_PUBLIC_KEY
// );

const rooms = {};

const StreamingController = {
  async createStream(req, res) {
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
      const user_id = decoded.id;

      const { topic_id, title, thumbnail, stream_url } = req.body;

      if (!topic_id) {
        return res.status(400).json({
          success: false,
          message: "Topic ID is required",
        });
      }

      // 👇 Check if the user already has a stream
      const existingStream = await Streams.findOne({ where: { user_id } });

      if (existingStream) {
        // 🔁 Update existing stream
        await existingStream.update({
          topic_id,
          title: title || existingStream.title,
          thumbnail: thumbnail || existingStream.thumbnail,
          stream_url: stream_url || existingStream.stream_url,
          is_live: true, // Optionally mark as live
        });

        return res.status(200).json({
          success: true,
          message: "Stream updated",
          stream: existingStream,
        });
      }

      // ✅ Create new stream
      const newStream = await Streams.create({
        user_id,
        topic_id,
        title: title || "Untitled Stream",
        thumbnail: thumbnail || null,
        stream_url: stream_url || topic_id,
        is_live: true,
      });

      res.status(201).json({
        success: true,
        message: "Stream created",
        stream: newStream,
      });
    } catch (error) {
      console.error("❌ Create stream error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create stream",
        error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
      });
    }
  },

  async startStream(req, res) {
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

      // Get user_id from token
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { title, thumbnail, topic_id, stream_url } = req.body;

      if (!title || !topic_id || !stream_url) {
        return res.status(400).json({
          success: false,
          message: "Title, topic_id, and stream_url are required",
        });
      }

      const stream = await Streams.findOne({ where: { topic_id } });
      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      // Check if the authenticated user owns this stream
      if (stream.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: "You can only start your own stream",
        });
      }

      await Streams.destroy({
        where: {
          user_id,
          is_live: false,
          topic_id: { [Op.ne]: topic_id } // 👈 EXCLUDE current one
        }
      });

      Object.assign(stream, { title, thumbnail, stream_url, is_live: true });
      await stream.save();

      res.status(200).json({
        success: true,
        message: "Stream started successfully",
        stream: {
          stream_id: stream.id,
          title: stream.title,
          thumbnail: stream.thumbnail,
          stream_url: stream.stream_url,
          is_live: stream.is_live,
          topic_id: stream.topic_id,
        },
      });
    } catch (error) {
      console.error("❌ Start stream error:", error);

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
        message: "Failed to start stream",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async stopStream(req, res) {
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

      // Get user_id from token
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { topic_id } = req.body;

      if (!topic_id) {
        return res.status(400).json({
          success: false,
          message: "Topic ID is required",
        });
      }

      const stream = await Streams.findOne({ where: { topic_id } });
      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      // Check if the authenticated user owns this stream
      if (stream.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: "You can only stop your own stream",
        });
      }

      stream.is_live = false;
      await stream.save();

      res.status(200).json({
        success: true,
        message: "Stream stopped successfully",
        stream: {
          stream_id: stream.id,
          topic_id: stream.topic_id,
          is_live: stream.is_live,
        },
      });
    } catch (error) {
      console.error("❌ Stop stream error:", error);

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
        message: "Failed to stop stream",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getAllStreams(req, res) {
    try {
      console.log("🔍 Starting getAllStreams...");

      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      console.log("🔑 Auth header:", authHeader);

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      console.log("📝 Token extracted:", token ? "exists" : "missing");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded:", decoded);

      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      console.log("🔍 Fetching streams from database...");

      const streams = await Streams.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username", "profile_picture", "bio"],
          },
        ],
        attributes: [
          "id",
          "user_id",
          "title",
          "thumbnail",
          "stream_url",
          "is_live",
          "topic_id",
        ],
        raw: true,
        nest: true,
      });

      console.log("📊 Streams found:", streams?.length || 0);

      res.status(200).json({
        success: true,
        streams,
      });
    } catch (error) {
      console.error("❌ Get all streams error:", error);
      console.error("❌ Error stack:", error.stack); // Tambahkan ini

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
        message: "Failed to fetch streams",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getLiveRooms(req, res) {
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

      const liveStreams = await Streams.findAll({
        where: { is_live: true },
        attributes: ["stream_url", "title", "thumbnail", "topic_id"],
      });

      const liveRooms = liveStreams.map((stream) => ({
        stream_url: stream.stream_url,
        title: stream.title,
        thumbnail: stream.thumbnail,
        topic_id: stream.topic_id,
      }));

      res.status(200).json({
        success: true,
        liveRooms,
      });
    } catch (error) {
      console.error("❌ Get live rooms error:", error);

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
        message: "Failed to fetch live rooms",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async createRoom(req, res) {
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

      // Get user_id from token
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { topic_id } = req.body;

      if (!topic_id) {
        return res.status(400).json({
          success: false,
          message: "Topic ID is required",
        });
      }

      // Verify that the user owns this stream
      const stream = await Streams.findOne({
        where: { topic_id, user_id },
      });

      if (!stream) {
        return res.status(404).json({
          success: false,
          message:
            "Stream not found or you don't have permission to create this room",
        });
      }

      if (rooms[topic_id]) {
        return res.status(409).json({
          success: false,
          message: "Room already exists",
        });
      }

      rooms[topic_id] = {
        streamers: [],
        watchers: [],
        currentOffer: null,
        iceCandidates: [],
      };

      res.status(201).json({
        success: true,
        message: `Room ${topic_id} created`,
        roomId: topic_id,
      });
    } catch (error) {
      console.error("❌ Create room error:", error);

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
        message: "Failed to create room",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async joinRoom(req, res) {
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

      const { roomId, role } = req.body;

      if (!roomId || !role) {
        return res.status(400).json({
          success: false,
          message: "Room ID and role are required",
        });
      }

      if (!rooms[roomId]) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      res.status(200).json({
        success: true,
        message: `Joined room ${roomId} as ${role}`,
        roomId,
        role,
      });
    } catch (error) {
      console.error("❌ Join room error:", error);

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
        message: "Failed to join room",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getStream(req, res) {
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

      const { user_id } = req.params;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const stream = await Streams.findOne({ where: { user_id } });

      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      res.status(200).json({
        success: true,
        stream,
      });
    } catch (error) {
      console.error("❌ Get stream error:", error);

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
        message: "Failed to fetch stream",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getStreamer(req, res) {
    try {
      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] === "null") {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user_id from token
      const currentUserId = decoded.id;
      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const { topic_id } = req.params;

      if (!topic_id) {
        return res.status(400).json({
          success: false,
          message: "Topic ID is required",
        });
      }

      const stream = await Streams.findOne({
        where: { topic_id },
        include: "user",
      });

      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Streamer not found",
        });
      }

      const userProfile = await User.findOne({
        where: { user_id: stream.user_id },
      });

      const followerCount = await Follower.count({
        where: { following_id: stream.user_id },
      });
      const isFollowing = await Follower.findOne({
        where: {
          follower_id: currentUserId,
          following_id: stream.user_id,
        },
      });

      userProfile.dataValues.followerCount = followerCount;

      res.status(200).json({
        success: true,
        streamer: stream,
        userProfile,
        is_followed: !!isFollowing,
      });
    } catch (error) {
      console.error("❌ Get streamer error:", error);

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
        message: "Failed to fetch streamer",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async searchStream(req, res) {
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

      const { search } = req.params;

      if (!search) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const streams = await Streams.findAll({
        where: {
          title: { [Op.like]: `%${search}%` },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username", "profile_picture", "bio"],
          },
        ],
        attributes: [
          "id",
          "user_id",
          "title",
          "thumbnail",
          "stream_url",
          "is_live",
          "topic_id",
        ],
        raw: true,
        nest: true,
      });

      res.status(200).json({
        success: true,
        streams,
        searchQuery: search,
      });
    } catch (error) {
      console.error("❌ Search stream error:", error);

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
        message: "Failed to search stream",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  async getRooms(req, res) {
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

      res.status(200).json({
        success: true,
        rooms: Object.keys(rooms),
      });
    } catch (error) {
      console.error("❌ Get rooms error:", error);

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
        message: "Failed to fetch rooms",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  },

  initializeSocketIO(server) {
    const io = new Server(server, {
      cors: {
        origin: "https://conversia-stream.vercel.app",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      socket.on("join-room", (roomId, role) => {
        if (!rooms[roomId]) {
          rooms[roomId] = {
            streamers: [],
            watchers: [],
            currentOffer: null,
            iceCandidates: [],
          };
        }

        if (role === "streamer") rooms[roomId].streamers.push(socket.id);
        else if (role === "watcher") {
          rooms[roomId].watchers.push(socket.id);
          if (rooms[roomId].currentOffer)
            socket.emit("offer", rooms[roomId].currentOffer);
          rooms[roomId].iceCandidates.forEach((c) =>
            socket.emit("ice-candidate", c)
          );
        }

        socket.join(roomId);
        socket.role = role;
        socket.roomId = roomId;

        socket
          .to(roomId)
          .emit("user-connected", { id: socket.id, role, roomid: roomId });
      });

      socket.on("offer", (roomId, offer) => {
        if (rooms[roomId]) rooms[roomId].currentOffer = offer;
        socket.to(roomId).emit("offer", offer);
      });

      socket.on("answer", (roomId, answer) => {
        socket.to(roomId).emit("answer", answer);
      });

      socket.on("chat", (roomId, message) => {
        new TopicMessageSubmitTransaction()
          .setTopicId(roomId)
          .setMessage(message.content)
          .execute(client);
        socket.to(roomId).emit("chat", message);
      });

      socket.on("ice-candidate", (roomId, candidate) => {
        if (rooms[roomId]) {
          rooms[roomId].iceCandidates.push(candidate);
          socket.to(roomId).emit("ice-candidate", candidate);
        }
      });

      socket.on("stop-stream", async (roomId) => {
        if (rooms[roomId]) {
          rooms[roomId].streamers = rooms[roomId].streamers.filter(
            (id) => id !== socket.id
          );
          rooms[roomId].currentOffer = null;
          rooms[roomId].iceCandidates = [];
          socket.to(roomId).emit("stream-stopped", socket.id);

          const stream = await Streams.findOne({ where: { topic_id: roomId } });
          if (stream && rooms[roomId].streamers.length === 0) {
            stream.is_live = false;
            await stream.save();
          }
        }
      });

      socket.on("disconnect", () => {
        const { role, roomId } = socket;
        if (!roomId || !rooms[roomId]) return;

        if (role === "streamer") {
          rooms[roomId].streamers = rooms[roomId].streamers.filter(
            (id) => id !== socket.id
          );
        } else if (role === "watcher") {
          rooms[roomId].watchers = rooms[roomId].watchers.filter(
            (id) => id !== socket.id
          );
        }

        socket.to(roomId).emit("user-disconnected", { id: socket.id, role });

        if (
          rooms[roomId].streamers.length === 0 &&
          rooms[roomId].watchers.length === 0
        ) {
          delete rooms[roomId];
        }
      });
    });

    return io;
  },
};

export default StreamingController;
