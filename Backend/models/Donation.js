import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";
import Streams from "./Stream.js";


const Donations = db.define("donations", {
  sender_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: "user_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  receiver_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: "user_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  stream_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Streams,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  donated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});


export default Donations;
