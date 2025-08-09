import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const User = db.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    hederaAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    hederaPublicKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hederaPrivateKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Username cannot be empty",
        },
        len: {
          args: [1, 100],
          msg: "Username must be between 1 and 100 characters",
        },
      },
      field: "username",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
      field: "updated_at",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false,
    underscored: true,
    freezeTableName: true,
  }
);

export default User;
