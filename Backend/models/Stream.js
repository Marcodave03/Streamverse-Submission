import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";

const Streams = db.define("streams", {
   id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: "users",        
        key: "user_id",         
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
},
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stream_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_live: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  topic_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


export default Streams;
