import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { textDetectedMood, uploadAudio, uploadImage} from "../controllers/moodController.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

router.post('/text-mood', authenticate, textDetectedMood);
router.post("/voice-mood", uploadMiddleware, uploadAudio);
router.post("/image-mood", uploadImageMiddleware, uploadImage);

export default router;