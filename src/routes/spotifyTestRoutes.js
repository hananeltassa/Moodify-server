import express from "express";
import { testSpotifySignin, testSpotifyCallback } from "../controllers/spotifyTestController.js";

const router = express.Router();

// Initiate Spotify Sign-In
router.get("/login", testSpotifySignin);

// Handle Spotify Callback
router.get("/callback", testSpotifyCallback);

export default router;

