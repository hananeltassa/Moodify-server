import axios from "axios";
import db from "../models/index.js";

export const textDetectedMood = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  if (!text) {
    return res.status(400).json({ error: 'Text input is required' });
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated." });
  }

  try {
    const response = await axios.post(`${process.env.DJANGO_API_BASE_URL}detect-text-mood/`, {
      input_data: text,
    });

    const { mood, confidence } = response.data;

    const MoodDetection = await db.MoodDetectionInput.create({
      user_id: userId,
      input_type: 'text',
      input_data: text,
      detected_mood: mood,
      confidence,
    });

    return res.status(200).json({
      success: true,
      MoodDetection,
    });

  } catch (error) {
    console.error('Error calling Django API:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || 'Error from Django API',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

