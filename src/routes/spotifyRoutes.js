import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { spotifyAuthMiddleware } from "../middlewares/authSpotify.js";
import { spotifySignin, spotifyCallback, getSpotifyPlaylistsUser, getPlaylistTracks, getUserLikedTracks, 
    getUserSavedAlbums, getAlbumTracks,
    searchSpotify,
    
} from "../controllers/spotifyController.js";

const router = express.Router();

router.get("/spotify/signin", spotifySignin);
router.get("/spotify/callback", spotifyCallback);

router.get("/spotify/playlists", authenticate, spotifyAuthMiddleware, getSpotifyPlaylistsUser);
router.get("/spotify/playlists/:playlistId/tracks", authenticate , spotifyAuthMiddleware, getPlaylistTracks);

router.get("/spotify/liked-tracks", authenticate , spotifyAuthMiddleware, getUserLikedTracks);
router.get("/spotify/saved-albums", authenticate , spotifyAuthMiddleware, getUserSavedAlbums);
router.get("/spotify/albums/:albumId/tracks", authenticate , spotifyAuthMiddleware, getAlbumTracks);

router.get("/spotify/search", authenticate, spotifyAuthMiddleware, searchSpotify);

//router.get("/spotify/featured-playlists", authenticate, getFeaturedPlaylists);

export default router;