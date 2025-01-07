import express from 'express';
import { createChallenge  } from '../controllers/aiCoachController.js';

const router = express.Router();

router.post('/create-challenge', createChallenge );

export default router;