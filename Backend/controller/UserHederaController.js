import Follower from "../models/Follower.js";
import Streams from "../models/Stream.js";
import User from "../models/User.js";
import { Op, Sequelize } from "sequelize";

const UserDiscoveryController = {
  // 📍 Get all user profiles
  async getAllUsers(req, res) {
    try {
      const profiles = await Profiles.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id"],
          },
        ],
        attributes: [
          "user_id",
          "full_name",
          "bio",
          "gender",
          "date_of_birth",
          "wallet_address",
          "profile_picture",
        ],
      });

      res.status(200).json(profiles);
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
      const profiles = await Profiles.findAll({
        where: {
          full_name: {
            [Op.like]: `%${name}%`,
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: [],
            include: [
              {
                model: Streams,
                as: "stream",
                attributes: [],
                required: false,
              },
            ],
          },
        ],
        attributes: [
          "user_id",
          "full_name",
          "bio",
          "profile_picture",
          [Sequelize.col("user.stream.topic_id"), "topic_id"],
          [Sequelize.col("user.stream.title"), "stream_title"],
          [Sequelize.col("user.stream.is_live"), "stream_is_live"],
        ],
      });

      if (profiles.length === 0) {
        return res.status(404).json({ message: "No users found with that name" });
      }

      // Add follower count to each profile
      for (const profile of profiles) {
        const followerCount = await Follower.count({
          where: { following_id: profile.user_id },
        });
        profile.dataValues.followerCount = followerCount;
      }

      res.status(200).json(profiles);
    } catch (error) {
      console.error("Error in getUsersByName:", error);
      res.status(500).json({
        message: "Failed to retrieve users",
        error: error.message,
      });
    }
  },
};

export default UserDiscoveryController;
