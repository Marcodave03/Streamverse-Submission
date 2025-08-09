import db from "../config/Database.js";
import User from "./User.js";
import Avatar from "./Avatar.js";
import Background from "./Background.js";
import ChatHistory from "./ChatHistory.js";
import Streams from "./Stream.js";
import Follower from "./Follower.js";
import Donations from "./Donation.js";

User.hasMany(Avatar, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Avatar.belongsTo(User, {
  foreignKey: "user_id",
});

User.hasMany(Background, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
})

Background.belongsTo(User, {
  foreignKey: "user_id",  
})

User.hasMany(ChatHistory, { 
  foreignKey: 'user_id' ,
  onDelete: "CASCADE",
});
ChatHistory.belongsTo(User, { 
  foreignKey: 'user_id' 
});

User.hasOne(Streams, {
  foreignKey: "user_id",
  as: "stream",
});
Streams.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});


// User associations
User.hasMany(Follower, {
  foreignKey: "following_id",
  as: "Followers", // orang-orang yang follow user ini
});
User.hasMany(Follower, {
  foreignKey: "follower_id", 
  as: "Following", // siapa aja yang di-follow sama user ini
});

// Follower associations
Follower.belongsTo(User, {
  foreignKey: "following_id",
  as: "FollowedUser", // user yang di-follow (target)
});
Follower.belongsTo(User, {
  foreignKey: "follower_id",
  as: "FollowerUser", // user yang melakukan follow (source)
});


User.hasMany(Donations, {
  foreignKey: "sender_id",
  as: "sentDonations",
});
User.hasMany(Donations, {
  foreignKey: "receiver_id",
  as: "receivedDonations",
});
Donations.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});
Donations.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

Streams.hasMany(Donations, {
  foreignKey: "stream_id",
  as: "donations",
});
Donations.belongsTo(Streams, {
  foreignKey: "stream_id",
  as: "stream",
});



db.sync({ alter: false })
export { User, Avatar };