import axios from "axios";
import db from "../models/index.js";
import path from "path";
import FormData from "form-data";
import fs from "fs";
import { Op } from 'sequelize';

export const textDetectedMood = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated." });
  }

  try {
    const response = await axios.post(`${process.env.DJANGO_API_BASE_URL}detect-text-mood/`, {
      input_data: text,
    });

    const { mood, confidence } = response.data;

    console.log(response.data);

    const MoodDetection = await db.MoodDetectionInput.create({
      user_id: userId,
      input_type: "text",
      input_data: text,
      detected_mood: mood,
      confidence,
    });

    return res.status(200).json({
      success: true,
      MoodDetection,
    });
  } catch (error) {
    console.error("Error calling Django API:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || "Error from Django API",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadAudio = async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const fileName = req.file.filename;

    console.log("Uploaded file details:", req.file);

    // Prepare form data for Django API
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: req.file.mimetype,
    });

    // Forward the audio file to the Django API
    const response = await axios.post(`${process.env.DJANGO_API_BASE_URL}detect-voice-mood/`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const { transcription, mood } = response.data;

    console.log(response.data);

    // Save the result to the database
    const MoodDetection = await db.MoodDetectionInput.create({
      user_id: userId,
      input_type: "voice",
      input_data: transcription,
      detected_mood: mood.mood,
      confidence: mood.confidence,
    });

    return res.status(200).json({
      success: true,
      MoodDetection,
    });
  } catch (error) {
    console.error("Error forwarding audio to Django:", error.message);

    return res.status(500).json({
      error: error.response?.data || "Internal server error",
    });
  }
};

export const uploadImage = async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const fileName = req.file.filename;

    console.log("Uploaded image details:", req.file);

    // Prepare form data for Django API
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: req.file.mimetype,
    });

    // Send the image to the Django backend
    const response = await axios.post(`${process.env.DJANGO_API_BASE_URL}detect-image-mood/`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const { mood, confidence } = response.data;

    // Save the result to the database
    const MoodDetection = await db.MoodDetectionInput.create({
      user_id: userId,
      input_type: "face",
      input_data: fileName,
      detected_mood: mood,
      confidence,
    });

    return res.status(200).json({
      success: true,
      MoodDetection,
    });
  } catch (error) {
    console.error("Error forwarding image to Django:", error.message);

    return res.status(500).json({
      error: error.response?.data || "Internal server error",
    });
  }
};

export const getUserAverageMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const moodInputs = await db.MoodDetectionInput.findAll({
      where: {
        user_id: userId,
        createdAt: { [Op.between]: [sevenDaysAgo, today] },
      },
    });

    if (!moodInputs || moodInputs.length === 0) {
      return res.status(404).json({ message: 'No mood inputs found for the user in the last 7 days.' });
    }

    const dailyMoodMap = {};
    moodInputs.forEach((input) => {
      const createdAt = new Date(input.createdAt);

      if (isNaN(createdAt)) {
        console.warn(`Invalid createdAt value for input ID: ${input.id}`);
        return; // Skip invalid entries
      }

      const dateKey = createdAt.toISOString().split('T')[0];
      if (!dailyMoodMap[dateKey]) {
        dailyMoodMap[dateKey] = [];
      }
      dailyMoodMap[dateKey].push(input.detected_mood);
    });

    const dailyMoods = Object.entries(dailyMoodMap).map(([date, moods]) => {
      const moodCounts = moods.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});

      const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

      return { date, most_common_mood: mostCommonMood };
    });

    dailyMoods.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json(dailyMoods);
  } catch (error) {
    console.error('Error fetching user average mood:', error);
    res.status(500).json({ message: 'An error occurred while fetching the user average mood.' });
  }
};