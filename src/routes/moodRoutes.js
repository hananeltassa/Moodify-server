import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { textDetectedMood, uploadAudio } from "../controllers/moodController.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post('/text-mood', authenticate, textDetectedMood);
router.post("/voice-mood", uploadMiddleware, uploadAudio);

export default router;