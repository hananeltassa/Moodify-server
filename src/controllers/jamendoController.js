import axios from "axios";
import { handleApiError } from "../utils/handleApiError.js"; 
import dotenv from "dotenv";

dotenv.config();

const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

// Fetch trending tracks
export const getTrendingTracks = async (req, res) => {
  try {
    const { data } = await axios.get(`${JAMENDO_API_BASE}/tracks`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID, 
        limit: 100, 
        order: "popularity_total", 
      },
    });

    const tracks = data.results.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name,
      duration: track.duration,
      audio: track.audio, 
      cover: track.image, 
    }));

    res.status(200).json({
      message: "Trending tracks fetched successfully!",
      tracks: data.results,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch trending tracks");
  }
};


export const getPlaylists = async (req, res) => {
  try {
    const { data } = await axios.get(`${JAMENDO_API_BASE}/playlists`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        limit: 10,
        //order: "popularity_total",
        //tags: "chill",
        namesearch: "chill",
        datebetween: "2024-01-01_2024-12-12",
      },
    });

    const playlists = data.results.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.short_description || "No description available",
      cover: playlist.image,
      track_count: playlist.tracks,
    }));

    res.status(200).json({
      message: "Playlists fetched successfully!",
      playlists: data.results,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch trending tracks from Jamendo.");
  }
};

export const getPlaylistTracks = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const { data } = await axios.get(`${JAMENDO_API_BASE}/playlists/tracks`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        id: playlistId,
      },
    });

    const tracks = data.results.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name,
      duration: track.duration,
      audio: track.audio,
      cover: track.image,
    }));

    res.status(200).json({
      message: "Tracks fetched successfully!",
      tracks: data.results,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch playlist tracks from Jamendo.");
  }
};

export const getArtists = async (req, res) => {
  try {
    const { data } = await axios.get(`${JAMENDO_API_BASE}/artists` ,{
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID, 
        limit: 100
      }

    });

    res.status(200).json({
      message: "Artists fetched successfully!",
      artists: data.results,
    });

  } catch (error) {
    handleApiError(error, res, "Failed to fetch artists from Jamendo.");
  }
}