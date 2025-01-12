import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { textDetectedMood, handleAudioUpload } from "../controllers/moodController.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post('/text-mood', authenticate, textDetectedMood);
router.post("/voice-mood", uploadMiddleware, handleAudioUpload);

export default router;