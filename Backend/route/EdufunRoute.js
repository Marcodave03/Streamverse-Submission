import express from "express";
import {
  GPTHelpController,
} from "../controller/EdufunController.js";

const router = express.Router();

// router.get("/edufun/lessons", getLessonList);
// router.get("/edufun/lessons/:id", getLessonContent);
router.post("/chat", GPTHelpController.chat);
// router.get("/:lessonId", LessonAudioController.getLessonAudio);

export default router;