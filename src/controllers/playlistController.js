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
      const userId = req.user.id; // Assuming `req.user` contains the authenticated user's details
      const playlists = await db.Playlist.findAll({
        where: { user_id: userId },
      });
  
      // Return an empty array if no playlists are found
      if (!playlists) {
        return res.status(200).json({ playlists: [] });
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
      const { source, external_id = null, metadata = {} } = req.body;
  
      // Validate request data
      if (!playlistId || !source) {
        return res.status(400).json({ error: "Playlist ID and source are required." });
      }
  
      // Check if playlist exists and belongs to the authenticated user
      const playlist = await db.Playlist.findOne({ where: { id: playlistId, user_id: req.user.id } });
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found or unauthorized access." });
      }
  
      // Validate metadata structure (optional but recommended)
      if (typeof metadata !== "object" || Array.isArray(metadata)) {
        return res.status(400).json({ error: "Metadata must be a valid JSON object." });
      }
  
      // Add the song to the playlist
      const song = await db.PlaylistSongs.create({
        playlist_id: playlistId,
        source,
        external_id,
        metadata,
      });
  
      res.status(201).json({
        message: "Song successfully added to playlist.",
        song,
      });
    } catch (error) {
      console.error("Error adding song to playlist:", error);
  
      // Handle specific Sequelize errors
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ error: "Invalid data format.", details: error.errors });
      }
  
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
    const { playlistId, songTitle } = req.params; // Use songTitle instead of songId
    const userId = req.user.id;

    // Check if the playlist exists and belongs to the user
    const playlist = await db.Playlist.findOne({
      where: { id: playlistId, user_id: userId },
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found or not authorized." });
    }

    // Check if the song exists in the playlist based on the title
    const songExists = await db.PlaylistSongs.findOne({
      where: {
        playlist_id: playlistId,
        'metadata.title': songTitle, // Match the song title in the metadata
      },
    });

    if (!songExists) {
      return res.status(404).json({ message: "Song not found in the playlist." });
    }

    // Delete the song
    await db.PlaylistSongs.destroy({
      where: {
        playlist_id: playlistId,
        'metadata.title': songTitle, // Match the song title in the metadata
      },
    });

    res.status(200).json({ message: "Song removed from playlist successfully." });
  } catch (error) {
    console.error("Error deleting song from playlist:", error);
    res.status(500).json({ error: "Failed to delete song from playlist." });
  }
};

