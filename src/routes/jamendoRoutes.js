import express from "express";
import {getTrendingTracks, 
    getPlaylists, 
    getPlaylistTracks, 
    getTracksByGenre,
    searchMusic,
    getArtists,
    getNewReleases,
    getAlbums
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

export default router;