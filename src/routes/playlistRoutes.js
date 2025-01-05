import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  getPlaylistSongs,
  deleteSongFromPlaylist,
} from "../controllers/playlistController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createPlaylist);
router.get("/:userId", authenticateUser, getUserPlaylists);
router.post("/:playlistId/songs", authenticateUser, addSongToPlaylist);
router.get("/:playlistId/songs", authenticateUser, getPlaylistSongs);
router.delete("/:playlistId/songs/:songId", authenticateUser, deleteSongFromPlaylist);

export default router;
