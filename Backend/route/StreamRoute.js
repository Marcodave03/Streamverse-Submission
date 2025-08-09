// streamverse
import express from "express";
import DonationController from "../controller/DonationController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";
import StreamingController from "../controller/StreamingController.js";
import FollowerController from "../controller/FollowerController.js";

const router = express.Router();

router.post("/donate", authMiddleware, DonationController.donateToStreamer);
router.get("/stream/:roomId/receiver", DonationController.getReceiverAccountId);

router.post("/streams", StreamingController.createStream);  
router.patch("/start-stream", StreamingController.startStream);
router.get("/rooms", StreamingController.getRooms);
router.post("/rooms", StreamingController.createRoom);
router.post("/join-room", StreamingController.joinRoom);
router.get("/live-rooms", StreamingController.getLiveRooms);


router.post("/stop-stream", StreamingController.stopStream);


router.get("/streamer/:topic_id", StreamingController.getStreamer);
router.get("/search/:search", StreamingController.searchStream);


router.get("/:user_id", StreamingController.getStream);
router.get("/", StreamingController.getAllStreams);



export default router;
