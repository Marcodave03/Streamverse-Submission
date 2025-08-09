import Follower from "../models/Follower.js";
import User from "../models/User.js";
import Streams from "../models/Stream.js";
import { Op, Sequelize } from "sequelize";
import jwt from "jsonwebtoken";

const FollowerController = {
  async followUser(req, res) {
    try {
      // Extract token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const followerId = decoded.id;

      const { followingId } = req.body;

      console.log("🔍 Request data:", { followerId, followingId });

      if (!followerId || !followingId) {
        return res
          .status(400)
          .json({ error: "Missing user ID or following ID" });
      }

      if (followerId === followingId) {
        return res.status(400).json({ error: "You cannot follow yourself" });
      }

      const followExists = await Follower.findOne({
        where: { follower_id: followerId, following_id: followingId },
      });

      if (followExists) {
        return res
          .status(400)
          .json({ error: "You are already following this user" });
      }

      const newFollow = await Follower.create({
        follower_id: followerId,
        following_id: followingId,
      });

      res.status(201).json({
        message: "Successfully followed the user",
        newFollow,
      });
    } catch (error) {
      console.error("❌ Error in followUser controller:", error);
      res.status(500).json({ error: "Failed to follow user" });
    }
  },

  async unfollowUser(req, res) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const followerId = decoded.id;

      const { followingId } = req.body;

      if (!followerId || !followingId) {
        return res
          .status(400)
          .json({ error: "Missing user ID or following ID" });
      }

      const followExists = await Follower.findOne({
        where: { follower_id: followerId, following_id: followingId },
      });

      if (!followExists) {
        return res
          .status(400)
          .json({ error: "You are not following this user" });
      }

      await Follower.destroy({
        where: { follower_id: followerId, following_id: followingId },
      });

      res.status(200).json({ message: "Successfully unfollowed the user" });
    } catch (error) {
      console.error("❌ Error in unfollowUser controller:", error);
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  },

  async getUserFollowers(req, res) {
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

      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const followers = await Follower.findAll({
        where: { following_id: user_id }, // user being followed
        include: [
          {
            model: User,
            as: "FollowerUser", // the one who follows
            attributes: ["user_id", "username", "profile_picture", "bio"],
          },
        ],
      });

      const followerList = followers.map((f) => ({
        followerId: f.follower_id,
        username: f.FollowerUser?.username || "Unknown",
        profilePicture: f.FollowerUser?.profile_picture || null,
        bio: f.FollowerUser?.bio || "",
      }));

      res.status(200).json(followerList);
    } catch (error) {
      console.error("Error in getUserFollowers:", error);
      res.status(500).json({ error: "Failed to retrieve followers" });
    }
  },

  async getUserFollowing(req, res) {
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

      // Get user_id from token
      const user_id = decoded.id;
      if (!user_id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      const following = await Follower.findAll({
        where: { follower_id: user_id }, // userId yang follow
        include: [
          {
            model: User,
            as: "FollowedUser", // ambil data user yang di-follow
            attributes: ["user_id", "username", "profile_picture", "bio"],
            required: false,
          },
        ],
      });

      console.log("Following data:", JSON.stringify(following, null, 2));

      const followingList = following.map((follow) => ({
        followingId: follow.following_id,
        fullName: follow.FollowedUser?.username || "Unknown",
        profilePicture: follow.FollowedUser?.profile_picture || null,
        bio: follow.FollowedUser?.bio || "",
        isLive: false,
        topicId: null,
      }));

      res.status(200).json(followingList);
    } catch (error) {
      console.error("Error in getUserFollowing:", error);
      res.status(500).json({ error: "Failed to retrieve following" });
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ["user_id", "username", "bio", "profile_picture"],
      });

      res.status(200).json(users);
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json({
        message: "Failed to retrieve users",
        error: error.message,
      });
    }
  },

  // 🔍 Search user profiles by full name
  async getUsersByName(req, res) {
    const { name } = req.params;

    try {
      const users = await User.findAll({
        where: {
          username: {
            [Op.like]: `%${name}%`, // case-insensitive LIKE
          },
        },
        include: [
          {
            model: Streams,
            as: "stream",
            attributes: ["topic_id", "title", "is_live"],
            required: false,
          },
        ],
        attributes: ["user_id", "username", "bio", "profile_picture"],
      });

      if (users.length === 0) {
        return res
          .status(404)
          .json({ message: "No users found with that name" });
      }

      for (const user of users) {
        const followerCount = await Follower.count({
          where: { following_id: user.user_id },
        });
        user.dataValues.followerCount = followerCount;
      }

      res.status(200).json(users);
    } catch (error) {
      console.error("Error in getUsersByName:", error);
      res.status(500).json({
        message: "Failed to retrieve users",
        error: error.message,
      });
    }
  },
};

export default FollowerController;
