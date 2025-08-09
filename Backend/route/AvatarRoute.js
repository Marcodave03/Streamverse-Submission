// conversia
import express from "express";
import AvatarController from "../controller/AvatarController.js";
import BackgroundController from "../controller/BackgroundController.js";
import ChatHistoryController from "../controller/ChatHistoryController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Conversia Avatar Routes
router.post("/users/avatars", AvatarController.createAvatar);
router.get("/users/avatars", AvatarController.getAvatarsByUser);
router.get("/avatars/:id", AvatarController.getAvatarById);

// Conversia Background Routes
router.post("/users/background", BackgroundController.createBackground);
router.get("/background", BackgroundController.getAllBackgrounds);
router.get("/user/background", BackgroundController.getBackgroundsByUser);
router.get("/background/:id", BackgroundController.getBackgroundById);


// Routes (JWT verification dilakukan di dalam controller)
router.get("/chat/:model_id/history", ChatHistoryController.getHistory);
router.post("/chat/:model_id/message", ChatHistoryController.addMessage);
// router.post("/chat/:model_id/voice",upload.single("audio"),ChatHistoryController.transcribeAndReply);
router.post("/speech-to-text/:user_id/:model_id",upload.single("audio"),ChatHistoryController.transcribeAndReply);

export default router;
