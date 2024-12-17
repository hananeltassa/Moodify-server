import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { spotifySignin, spotifyCallback, getSpotifyPlaylists } from "../controllers/spotifyController.js";

const router = express.Router();

router.get("/spotify/signin", spotifySignin);
router.get("/spotify/callback", spotifyCallback);
router.get("/spotify/playlists", authenticate , getSpotifyPlaylists)

export default router;
