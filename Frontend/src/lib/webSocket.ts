import { io } from "socket.io-client";

const socket = io("https://conversia-backend-hedera.onrender.com", {
  transports: ["websocket", "polling"],
});

export default socket;
