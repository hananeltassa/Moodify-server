import express from "express";
import {getTrendingTracks, getPlaylists, getPlaylistTracks } from "../controllers/jamendoController.js";

const router = express.Router();

router.get("/trending", getTrendingTracks);
router.get("/playlists", getPlaylists);
router.get("/playlists/:playlistId/tracks", getPlaylistTracks); 

export default router;
