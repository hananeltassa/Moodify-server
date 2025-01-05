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
