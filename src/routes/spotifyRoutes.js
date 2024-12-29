import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { spotifyAuthMiddleware } from "../middlewares/authSpotify.js";
import {
  spotifyCallback,
  getSpotifyPlaylistsUser,
  getPlaylistTracks,
  getUserLikedTracks,
  getUserSavedAlbums,
  getAlbumTracks,
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

// Authentication route
router.post("/spotify/callback", spotifyCallback);

// Spotify user content routes
router.use(authenticate, spotifyAuthMiddleware);

router.get("/spotify/playlists", getSpotifyPlaylistsUser);
router.get("/spotify/playlists/:playlistId/tracks", getPlaylistTracks);
router.get("/spotify/liked-tracks", getUserLikedTracks);
router.get("/spotify/saved-albums", getUserSavedAlbums);
router.get("/spotify/albums/:albumId/tracks", getAlbumTracks);
router.get("/spotify/search", searchSpotify);
router.get("/spotify/mood-playlists", getMoodBasedPlaylists);
router.get("/spotify/new-releases", getNewReleases);

// Spotify playback control routes
router.put("/spotify/play", startPlayback);
router.put("/spotify/pause", pausePlayback);
router.post("/spotify/next", skipToNextTrack);
router.post("/spotify/previous", skipTopreviousTrack);
router.post("/refresh", refreshSpotifyData);

export default router;