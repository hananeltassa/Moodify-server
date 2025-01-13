import { OpenAI } from 'openai';
import db from '../models/index.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createChallenge = async (req, res) => {
  const { mood, time_of_day } = req.body;
  const userId = req.user.id;

  if (!userId || !mood || !time_of_day) {
    return res.status(400).json({ error: 'Missing required fields: mood, time_of_day, or user authentication.' });
  }

  try {
    // Fetch existing challenges for the user and time_of_day
    const existingChallenges = await db.Challenge.findAll({
      where: {
        user_id: userId,
        time_of_day,
      },
      attributes: ['text'],
    });

    const existingChallengeTexts = existingChallenges.map((challenge) => challenge.text.title.toLowerCase());

    // Generate prompt with context to avoid duplicates
    const prompt = `Generate a unique ${time_of_day} challenge for someone feeling ${mood} to improve their mental health.
      Do not repeat the following challenges: ${existingChallengeTexts.join(', ')}.
      Return the response in the following JSON format:
      {
        "title": "[A short title]",
        "description": "[A concise description, under 20 words]",
        "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
      }`;

    let challengeData;
    let retries = 3;

    do {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
      });

      challengeData = JSON.parse(response.choices[0].message.content.trim());

      if (
        challengeData &&
        challengeData.title &&
        !existingChallengeTexts.includes(challengeData.title.toLowerCase())
      ) {
        break;
      }

      retries -= 1;
    } while (retries > 0);

    if (!challengeData || retries === 0) {
      throw new Error('Failed to generate a unique challenge after multiple attempts');
    }

    const challenge = await db.Challenge.create({
      user_id: userId,
      text: challengeData,
      type: 'AI-generated',
      status: 'pending',
      time_of_day,
      is_daily: true,
    });

    res.status(201).json({
      message: 'Challenge generated successfully',
      challenge,
    });
  } catch (error) {
    console.error('Error generating challenge:', error.message || error);
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
};


export const updateChallengeStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;

  const userId = req.user.id;

  if (!status || !['pending', 'completed', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status. Valid statuses: pending, completed, rejected.' });
  }

  try {
    const challenge = await db.Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this challenge.' });
    }

    challenge.status = status;

    if (status === 'completed') {
      challenge.completed_at = new Date();
    } else {
      challenge.completed_at = null;
    }

    await challenge.save();

    res.status(200).json({
      message: 'Challenge status updated successfully',
      challenge,
    });
  } catch (error) {
    console.error('Error updating challenge status:', error.message || error);
    res.status(500).json({ error: 'Failed to update challenge status' });
  }
};

export const getChallenges = async (req, res) => {
  const userId = req.user.id;
  const { status, time_of_day } = req.query;

  try {
    const where = { user_id: userId };
    if (status) where.status = status;
    if (time_of_day) where.time_of_day = time_of_day;

    const challenges = await db.Challenge.findAll({ where });
    res.status(200).json({ challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};


export const deleteChallenge = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const challenge = await db.Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this challenge.' });
    }

    await challenge.destroy();
    res.status(200).json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error.message || error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
};

export const generateDailyChallenges = async (req, res) => {
  const userId = req.user.id;

  const timesOfDay = ['morning', 'afternoon', 'night'];
  const mood = 'neutral'; // Example mood; you can extend this logic to fetch the user's current mood.

  try {
    const challenges = [];

    for (const time_of_day of timesOfDay) {
      const prompt = `Generate a ${time_of_day} challenge for someone feeling ${mood}. Return the response in the following JSON format: { "title": "...", "description": "...", "hashtags": [...] }`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      });

      const challengeData = JSON.parse(response.choices[0].message.content.trim());

      const challenge = await db.Challenge.create({
        user_id: userId,
        text: challengeData,
        type: 'AI-generated',
        status: 'pending',
        time_of_day,
        is_daily: true,
      });

      challenges.push(challenge);
    }

    res.status(201).json({
      message: 'Daily challenges generated successfully',
      challenges,
    });
  } catch (error) {
    console.error('Error generating daily challenges:', error.message || error);
    res.status(500).json({ error: 'Failed to generate daily challenges' });
  }
};


export const getUserStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const totalChallenges = await db.Challenge.count({ where: { user_id: userId } });
    const completedChallenges = await db.Challenge.count({ where: { user_id: userId, status: 'completed' } });

    const stats = {
      totalChallenges,
      completedChallenges,
      completionRate: totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};
