import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getPlaylistSongs,
  deleteSongFromPlaylist,
} from "../controllers/playlistController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createPlaylist);
router.get("/", authenticate, getUserPlaylists);
router.post("/:playlistId/songs", authenticate, addSongToPlaylist);
router.get("/:playlistId/songs", authenticate, getPlaylistSongs);
router.delete("/:playlistId/songs/:songId", authenticate, deleteSongFromPlaylist);

export default router;
