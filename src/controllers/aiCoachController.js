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
    const prompt = `Generate a ${time_of_day} challenge for someone feeling ${mood} to improve their mental health.
      Return the response in the following JSON format:
      {
        "title": "[A short title]",
        "description": "[A concise description, under 20 words]",
        "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
      }`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
    });

    const challengeData = JSON.parse(response.choices[0].message.content.trim());

    if (
      !challengeData.title ||
      !challengeData.description ||
      !challengeData.hashtags ||
      !Array.isArray(challengeData.hashtags)
    ) {
      throw new Error('Invalid response format from OpenAI');
    }

    const challenge = await db.Challenge.create({
      userId,
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
