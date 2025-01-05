import express from "express";
import {
  createPlaylist,
} from "../controllers/playlistController.js";

const router = express.Router();


router.post("/", createPlaylist);

router.get("/:userId", getUserPlaylists);

router.post("/:playlistId/songs", addSongToPlaylist);

router.get("/:playlistId/songs", getPlaylistSongs);

router.delete("/:playlistId/songs/:songId", deleteSongFromPlaylist);

export default router;
