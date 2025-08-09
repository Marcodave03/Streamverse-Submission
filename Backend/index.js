import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";
import sequelize from "./config/Database.js";
import "./models/Association.js";
import AvatarRoute from "./route/AvatarRoute.js";
import StreamRoute from "./route/StreamRoute.js";
import UserRoute from "./route/UserRoute.js";
import FollowerRoute from "./route/FollowerRoute.js";
import NftRoute from "./route/NftRoute.js";
import EdufunRoute from "./route/EdufunRoute.js";

// Initialize server
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://conversia-stream.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const port = process.env.PORT;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  socket.on("join-room", (roomId, role) => {
    console.log(`👥 ${role} joined room: ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", { id: socket.id, role });
  });

  socket.on("offer", (roomId, offer) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (roomId, answer) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", (roomId, candidate) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("chat", (roomId, message) => {
    socket.to(roomId).emit("chat", message);
  });

  socket.on("stop-stream", (roomId) => {
    socket.to(roomId).emit("stop-stream");
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
  });
});

// Static & Route
app.use("/audios", express.static("audios"));
app.use("/api/conversia", AvatarRoute);
app.use("/api/streamverse", StreamRoute);
app.use("/api/streamverse/follow", FollowerRoute);
app.use("/api/account", UserRoute);
app.use("/api/nft", NftRoute);
app.use("/api/edufun", EdufunRoute);

// Start server
if (!port) {
  console.error("Critical Error: PORT not defined in environment variables.");
  process.exit(1);
}

(async () => {
  try {
    server.listen(port, () => {
      console.log(`✅ Server operational at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed starting server or syncing database:", err);
    process.exit(1);
  }
})();
