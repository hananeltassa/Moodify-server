import axios from "axios";

export const startPlayback = async (req, res) => {
    try{
        const { spotifyToken } = req;
        const { context_uri, uris, position_ms } = req.body;

        await axios.put("https://api.spotify.com/v1/me/player/play",
            { context_uri, uris, position_ms },
            {
              headers: {
                Authorization: `Bearer ${spotifyToken}`,
              },
            }
        );
        
        res.json({ message: "Playback started/resumed successfully!" });
    } catch (error){
        console.error("Error starting playback:", error.response?.data || error.message);

        if (error.response?.status === 404) {
        return res.status(404).json({ message: "No active device found. Please open Spotify on a device." });
        }

        res.status(500).json({ message: "Failed to start playback." });
    }
};

