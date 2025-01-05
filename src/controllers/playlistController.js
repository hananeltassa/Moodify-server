import db from "../models/index.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name, isDefault } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated." });
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
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated." });
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
    const userId = req.user.id;

    if (!source || !metadata) {
      return res.status(400).json({ message: "Source and metadata are required." });
    }

    const playlistExists = await db.Playlist.findOne({
      where: { id: playlistId, user_id: userId },
    });
    if (!playlistExists) {
      return res.status(404).json({ message: "Playlist not found or not authorized." });
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
    const userId = req.user.id;

    const playlist = await db.Playlist.findOne({
      where: { id: playlistId, user_id: userId },
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found or not authorized." });
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

// Delete a song from a playlist
export const deleteSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    const userId = req.user.id;

    const playlist = await db.Playlist.findOne({
      where: { id: playlistId, user_id: userId },
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found or not authorized." });
    }

    const songExists = await db.PlaylistSongs.findOne({
      where: { playlist_id: playlistId, id: songId },
    });

    if (!songExists) {
      return res.status(404).json({ message: "Song not found in the playlist." });
    }

    await db.PlaylistSongs.destroy({
      where: { playlist_id: playlistId, id: songId },
    });

    res.status(200).json({ message: "Song removed from playlist successfully." });
  } catch (error) {
    console.error("Error deleting song from playlist:", error);
    res.status(500).json({ error: "Failed to delete song from playlist." });
  }
};
