import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { textDetectedMood } from "../controllers/moodController.js";

const router = express.Router();

router.post('/text-mood', authenticate, textDetectedMood);

export default router;