import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";

const Follower = db.define(
  "follower",
  {
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "user_id", 
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "user_id", 
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: false,
  }
);

export default Follower;
