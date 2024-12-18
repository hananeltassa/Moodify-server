import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { spotifySignin, spotifyCallback, getSpotifyPlaylistsUser, getPlaylistTracks, getUserLikedTracks, getUserSavedAlbums } from "../controllers/spotifyController.js";

const router = express.Router();

router.get("/spotify/signin", spotifySignin);
router.get("/spotify/callback", spotifyCallback);

router.get("/spotify/playlists", authenticate , getSpotifyPlaylistsUser);
router.get("/spotify/playlists/:playlistId/tracks", authenticate , getPlaylistTracks);

router.get("/spotify/liked-tracks", authenticate , getUserLikedTracks);
router.get("/spotify/saved-albums", authenticate , getUserSavedAlbums);

export default router;