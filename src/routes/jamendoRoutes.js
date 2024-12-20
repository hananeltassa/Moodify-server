import express from "express";
import {getTrendingTracks, getPlaylists, getPlaylistTracks, getArtists} from "../controllers/jamendoController.js";

const router = express.Router();

router.get("/trending", getTrendingTracks);
router.get("/playlists", getPlaylists);
router.get("/playlists/:playlistId/tracks", getPlaylistTracks); 
router.get("/artists", getArtists); 

export default router;