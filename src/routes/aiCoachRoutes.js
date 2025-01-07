import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { createChallenge, updateChallengeStatus } from '../controllers/aiCoachController.js';

const router = express.Router();

router.post('/create-challenge', authenticate, createChallenge);
router.put('/challenges/:id/status', authenticate, updateChallengeStatus);

export default router;