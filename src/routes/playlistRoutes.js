import express from "express";
import {
  createPlaylist,
} from "../controllers/playlistController.js";

const router = express.Router();

router.post("/", createPlaylist);

export default router;
