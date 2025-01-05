import db from "../models/index.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { userId, name, isDefault } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const newPlaylist = await db.Playlist.create({
      user_id: userId,
      name: name || "My Playlist",
      is_default: isDefault || false,
    });

    res.status(201).json({ message: "Playlist created successfully", playlist: newPlaylist });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist." });
  }
};

// Get playlists for a user
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const playlists = await db.Playlist.findAll({
      where: { user_id: userId },
      include: [{ model: db.PlaylistSongs, as: "songs" }],
    });

    if (!playlists.length) {
      return res.status(404).json({ message: "No playlists found for this user." });
    }

    res.status(200).json({ playlists });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists." });
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { source, externalId, metadata } = req.body;

    if (!source || !metadata) {
      return res.status(400).json({ message: "Source and metadata are required." });
    }

    const playlistExists = await db.Playlist.findByPk(playlistId);
    if (!playlistExists) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    const newSong = await db.PlaylistSongs.create({
      playlist_id: playlistId,
      source,
      external_id: externalId || null,
      metadata,
    });

    res.status(201).json({ message: "Song added to playlist successfully.", song: newSong });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ error: "Failed to add song to playlist." });
  }
};

// Get songs in a playlist
export const getPlaylistSongs = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required." });
    }

    const playlist = await db.Playlist.findByPk(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." });
    }

    const songs = await db.PlaylistSongs.findAll({
      where: { playlist_id: playlistId },
    });

    res.status(200).json({ songs });
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    res.status(500).json({ error: "Failed to fetch playlist songs." });
  }
};
