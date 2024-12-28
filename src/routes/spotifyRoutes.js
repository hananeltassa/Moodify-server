import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { spotifyAuthMiddleware } from "../middlewares/authSpotify.js";
import { 
  spotifySignin, spotifyCallback,
  getSpotifyPlaylistsUser, getPlaylistTracks,
  getUserLikedTracks,
  getUserSavedAlbums, getAlbumTracks,
  searchSpotify, 
  getMoodBasedPlaylists,
  getNewReleases,
  refreshSpotifyData,
} from "../controllers/spotifyController.js";
import {
  startPlayback,
  pausePlayback,
  skipToNextTrack,
  skipTopreviousTrack,
} from "../controllers/spotifyPlaybackController.js";

const router = express.Router();

// Authentication routes
router.get("/spotify/signin", spotifySignin);
router.post("/spotify/callback", spotifyCallback);

// Spotify user content routes
router.get("/spotify/playlists", authenticate, spotifyAuthMiddleware, getSpotifyPlaylistsUser);
router.get("/spotify/playlists/:playlistId/tracks", authenticate, spotifyAuthMiddleware, getPlaylistTracks);
router.get("/spotify/liked-tracks", authenticate, spotifyAuthMiddleware, getUserLikedTracks);
router.get("/spotify/saved-albums", authenticate, spotifyAuthMiddleware, getUserSavedAlbums);
router.get("/spotify/albums/:albumId/tracks", authenticate, spotifyAuthMiddleware, getAlbumTracks);
router.get("/spotify/search", authenticate, spotifyAuthMiddleware, searchSpotify);
router.get("/spotify/mood-playlists", authenticate, spotifyAuthMiddleware, getMoodBasedPlaylists);
router.get("/spotify/new-releases", authenticate, spotifyAuthMiddleware, getNewReleases);

// Spotify playback control routes
router.put("/spotify/play", authenticate, spotifyAuthMiddleware, startPlayback);
router.put("/spotify/pause", authenticate, spotifyAuthMiddleware, pausePlayback);
router.post("/spotify/next", authenticate, spotifyAuthMiddleware, skipToNextTrack);
router.post("/spotify/previous", authenticate, spotifyAuthMiddleware, skipTopreviousTrack);
router.post("/refresh", authenticate, spotifyAuthMiddleware, refreshSpotifyData);

export default router;