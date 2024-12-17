import express from "express";
import { spotifySignin, spotifyCallback } from "../controllers/spotifyController.js";

const router = express.Router();

router.get("/spotify/signin", spotifySignin);
router.get("/spotify/callback", spotifyCallback);

export default router;
