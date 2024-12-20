import express from "express";
import {getTrendingTracks, getPlaylists} from "../controllers/jamendoController.js";

const router = express.Router();

router.get("/trending", getTrendingTracks); 
router.get("/playlists", getPlaylists); 

export default router;
