import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createChallenge,
  updateChallengeStatus,
  getChallenges,
  getChallengeById,
  deleteChallenge,
  generateDailyChallenges,
  getUserStats,
} from '../controllers/aiCoachController.js';

const router = express.Router();

router.post('/create-challenge', authenticate, createChallenge);
router.put('/challenges/:id/status', authenticate, updateChallengeStatus);
router.get('/challenges', authenticate, getChallenges);
router.get('/challenges/:id', authenticate, getChallengeById);
router.delete('/challenges/:id', authenticate, deleteChallenge);
router.post('/challenges/daily', authenticate, generateDailyChallenges);
router.get('/challenges/stats', authenticate, getUserStats);

export default router;