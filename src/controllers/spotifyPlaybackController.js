import { cat } from "@huggingface/transformers";
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

export const pausePlayback = async (req, res) => {
    try {
      const { spotifyToken } = req;
  
      await axios.put("https://api.spotify.com/v1/me/player/pause",
        {},
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
  
      res.json({ message: "Playback paused successfully!" });
    } catch (error) {
      console.error("Error pausing playback:", error.response?.data || error.message);
  
      if (error.response?.status === 404) {
        return res.status(404).json({ message: "No active device found. Please open Spotify on a device." });
      }
  
      res.status(500).json({ message: "Failed to pause playback." });
    }
};

export const skipToNextTrack = async(req, res) => {
    try {
        const { spotifyToken} = req;

        axios.post("https://api.spotify.com/v1/me/player/next",
            {},
            {
                headers: {
                    Authorization : `Bearer ${spotifyToken}`,
                },
            }
        );

        res.json({ message: "Skipped to the next track successfully!" });
    } catch (error){
        console.error("Error skipping to next track:", error.response?.data || error.message);

        if (error.response?.status === 404) {
        return res.status(404).json({ message: "No active device found. Please open Spotify on a device." });
        }

        res.status(500).json({ message: "Failed to skip to the next track." });
    }
}
  