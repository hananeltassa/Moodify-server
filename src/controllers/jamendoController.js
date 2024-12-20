import axios from "axios";
import { handleApiError } from "../utils/handleApiError.js"; 
import dotenv from "dotenv";

dotenv.config();

const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0";

export const getTrendingTracks = async (req, res) => {
  try {
    const { limit = 50, order = "popularity_total" } = req.query;

    const { data } = await axios.get(`${JAMENDO_API_BASE}/tracks`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID, 
        limit: parseInt(limit, 10),
        order,
      },
    });

    const tracks = data.results.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name,
      duration: track.duration,
      audio: track.audio,
      image: track.image, 
    }));

    res.status(200).json({
      message: "Trending tracks fetched successfully!",
      tracks,
      //tracks: data.results,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch trending tracks");
  }
};

export const getPlaylists = async (req, res) => {
  try {
    const { genre, date_from, date_to, search, limit = 10 } = req.query;

    const { data } = await axios.get(`${JAMENDO_API_BASE}/playlists`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        limit: parseInt(limit, 10),
        tags: genre || undefined,
        namesearch: search || undefined,
        datebetween: date_from && date_to ? `${date_from}_${date_to}` : undefined,
        //order: "popularity_total",
        //tags: "chill",
        //datebetween: "2024-01-01_2024-12-12",
      },
    });

    const playlists = data.results.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.short_description || "No description available",
      image: playlist.image,
      track_count: playlist.tracks,
    }));

    res.status(200).json({
      message: "Playlists fetched successfully!",
      //playlists,
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
      image: track.image,
    }));

    res.status(200).json({
      message: "Tracks fetched successfully!",
      tracks: data.results,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch playlist tracks from Jamendo.");
  }
};

export const getTracksByGenre = async (req, res) =>{
  try {
    const { genre, limit = 50 } = req.query;

    const { data } = await axios.get(`${JAMENDO_API_BASE}/tracks`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        tags: genre,
        limit: parseInt(limit, 10),
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
      message: `Tracks fetched successfully for genre: ${genre}!`,
      tracks,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch tracks by genre.");
  }
};

export const searchMusic = async (req, res) => {
  try {
    const { query, type = "tracks" } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required for search." });
    }

    const { data } = await axios.get(`${JAMENDO_API_BASE}/${type}`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        namesearch: query,
      },
    });

    const formatResults = (type, results) => {
      if (type === "tracks") {
        return results.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artist_name,
          album: track.album_name,
          duration: track.duration,
          audio: track.audio,
          image: track.image,
        }));
      }
      return results;
    };

    const formattedResults = formatResults(type, data.results);

    res.status(200).json({
      message: `${type} search results fetched successfully!`,
      results: formattedResults,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to search music.");
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
};

export const getNewReleases = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const { data } = await axios.get(`${JAMENDO_API_BASE}/tracks`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        order: "release_date",
        limit: parseInt(limit, 10),
      },
    });

    const tracks = data.results.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artist_name,
      album: track.album_name,
      duration: track.duration,
      audio: track.audio,
      image: track.image,
    }));

    res.status(200).json({
      message: "New releases fetched successfully!",
      tracks,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch new releases from Jamendo.");
  }
};

export const getAlbums = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    const { data } = await axios.get(`${JAMENDO_API_BASE}/albums`, {
      params: {
        client_id: process.env.JAMENDO_CLIENT_ID,
        namesearch: query,
        limit: parseInt(limit, 10),
      },
    });

    const albums = data.results.map((album) => ({
      id: album.id,
      name: album.name,
      artist: album.artist_name,
      release_date: album.release_date,
      image: album.image,
      track_count: album.tracks,
    }));

    res.status(200).json({
      message: "Albums fetched successfully!",
      albums,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch albums from Jamendo.");
  }
};
