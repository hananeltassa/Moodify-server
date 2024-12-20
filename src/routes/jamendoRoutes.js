import express from "express";
import {getTrendingTracks} from "../controllers/jamendoController.js";

const router = express.Router();

// Define routes
router.get("/trending", getTrendingTracks); 


export default router;
