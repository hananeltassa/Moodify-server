import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import {getTrendingTracks, 
    getPlaylists, 
    getPlaylistTracks, 
    getTracksByGenre,
    searchMusic,
    getArtists,
    getNewReleases,
    getAlbums,
    saveLikedItem,
} from "../controllers/jamendoController.js";


const router = express.Router();

router.get("/trending", getTrendingTracks);
router.get("/playlists", getPlaylists);
router.get("/playlists/:playlistId/tracks", getPlaylistTracks); 
router.get("/tracks/genre", getTracksByGenre);
router.get("/search", searchMusic);
router.get("/artists", getArtists); 
router.get("/new-release", getNewReleases); 
router.get("/albums", getAlbums); 
router.post("/liked",authenticate, saveLikedItem);

export default router;