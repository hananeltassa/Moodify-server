import axios from "axios";
import passport from "passport";
import db from "../models/index.js";
import { handleApiError } from "../utils/handleApiError.js";
import { generateJWT } from "../utils/generateJWT.js";
import { isDataStale } from "../utils/isDataStale.js";

export const spotifySignin = passport.authenticate("spotify", {
  scope: ["user-read-email", 
    "user-read-private", 
    "user-modify-playback-state", 
    "user-library-read", 
    "user-read-playback-state"
  ],
});

export const spotifyCallback = (req, res, next) => {
  passport.authenticate("spotify", { session: false }, async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Spotify Authentication Failed" });
    }

    try {
      let existingUser = await db.User.findOne({ where: { spotify_id: user.spotifyId } });

      if (!existingUser && user.email) {
        existingUser = await db.User.findOne({ where: { email: user.email } });
      }

      if (existingUser) {
        existingUser.access_token = user.accessToken;
        existingUser.refresh_token = user.refreshToken;
        await existingUser.save();
      } else {
        existingUser = await db.User.create({
          name: user.displayName || "Spotify User",
          email: user.email || null,
          password: "spotify_oauth_user",
          spotify_id: user.spotifyId,
          access_token: user.accessToken,
          refresh_token: user.refreshToken,
          profile_picture: user.profilePic,
          role: "user",
        });
      }

      const token = generateJWT(existingUser);

      return res.json({
        message: "Spotify Login Successful!",
        user: {
          id: existingUser.id,
          spotifyId: existingUser.spotify_id,
          name: existingUser.name,
          email: existingUser.email,
          profilePic: existingUser.profile_picture,
          access_token: user.accessToken,
          refresh_token: user.refreshToken,
        },
        token,
      });
    } catch (error) {
      console.error("Database Error:", error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  })(req, res, next);
};

export const getSpotifyPlaylistsUser = async (req, res) => {
  try {
    const { spotifyToken, userId } = req;

    const userSpotifyData = await db.SpotifyUserData.findOne({
      where: { user_id: userId },
    });

    if (userSpotifyData?.playlists && !isDataStale(userSpotifyData.updatedAt)) {
      return res.status(200).json({
        message: "Playlists fetched successfully from database!",
        playlists: userSpotifyData.playlists,
      });
    }

    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const playlists = data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      totalTracks: playlist.tracks.total,
      owner: {
        name: playlist.owner.display_name,
        url: playlist.owner.external_urls.spotify,
      },
    }));

    if (userSpotifyData) {
      userSpotifyData.playlists = playlists;
      await userSpotifyData.save(); 
    } else {
      await db.SpotifyUserData.create({
        user_id: userId,
        playlists,
      });
    }

    return res.status(200).json({
      message: "Playlists fetched successfully!",
      playlists,
        //playlists:data.items,
    });

    } catch (error) {
      handleApiError(error, res, "Failed to fetch playlist tracks");
    }
};

export const getPlaylistTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const { spotifyToken } = req;

    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const tracks = data.items.map((item) => ({
      name: item.track.name,
      artists: item.track.artists.map((artist) => artist.name),
      album: {
        name: item.track.album.name,
        uri: item.track.album.uri,
        images: item.track.album.images,
        release_date: item.track.album.release_date,
        total_tracks: item.track.album.total_tracks,
      },
      externalUrl: item.track.external_urls.spotify,
    }));

    return res.json({
      message: "Tracks fetched successfully!",
      total_tracks: data.total,
      tracks,
      //tracks: data.items,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch playlist tracks");
  }
};

export const getUserLikedTracks = async (req, res) => {
  try {
    const { spotifyToken, userId } = req;

    const userSpotifyData = await db.SpotifyUserData.findOne({
      where: { user_id: userId },
    });

    if (userSpotifyData?.liked_songs && !isDataStale(userSpotifyData.updatedAt)) {
      return res.status(200).json({
        message: "Liked tracks fetched successfully from database!",
        tracks: userSpotifyData.liked_songs,
      });
    }

    const { data } = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const tracks = data.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist) => artist.name),
      album: {
        name: item.track.album.name,
        images: item.track.album.images,
      },
      duration_ms: item.track.duration_ms,
      externalUrl: item.track.external_urls.spotify,
    }));

    if (userSpotifyData) {
      userSpotifyData.liked_songs = tracks;
      await userSpotifyData.save();
    } else {
      await db.SpotifyUserData.create({
        user_id: userId,
        liked_songs: tracks,
      });
    }

    return res.json({ message: "Liked tracks fetched successfully!", total_tracks: data.total, tracks });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch liked tracks");
  }
};

export const getUserSavedAlbums = async (req, res) => {
  try {
    const { spotifyToken } = req;

    const { data } = await axios.get("https://api.spotify.com/v1/me/albums", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const albums = data.items.map((item) => ({
      id: item.album.id,
      name: item.album.name,
      release_date: item.album.release_date,
      artists: item.album.artists.map((artist) => artist.name),
      totalTracks: item.album.total_tracks,
      images: item.album.images,
      externalUrl: item.album.external_urls.spotify,
    }));

    return res.json({ message: "Saved albums fetched successfully!", total_albums: data.total, albums });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch saved albums");
  }
};

export const getAlbumTracks = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { spotifyToken } = req;

    const { data } = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const tracks = data.items.map((track) => ({
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      duration_ms: track.duration_ms,
      trackNumber: track.track_number,
      externalUrl: track.external_urls.spotify,
    }));

    return res.json({ message: "Album tracks fetched successfully!", total: data.total, tracks });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch album tracks");
  }
};

export const searchSpotify = async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required." });
    }

    const { spotifyToken } = req;

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
      params: { q: query, type: type || "track,album,artist,playlist", limit: 10 },
    });

    const results = {
      artists: data.artists?.items
        ?.filter((item) => item?.name) 
        .map((item) => ({
          name: item.name,
          genres: item.genres,
          followers: item.followers?.total,
          externalUrl: item.external_urls?.spotify || null,
        })),
      tracks: data.tracks?.items
        ?.filter((item) => item?.name)
        .map((item) => ({
          name: item.name,
          artists: item.artists?.map((artist) => artist.name) || [],
          album: item.album?.name || "Unknown Album",
          externalUrl: item.external_urls?.spotify || null,
        })),
      albums: data.albums?.items
        ?.filter((item) => item?.name) 
        .map((item) => ({
          name: item.name,
          artists: item.artists?.map((artist) => artist.name) || [],
          totalTracks: item.total_tracks || 0,
          releaseDate: item.release_date || "Unknown Date",
          externalUrl: item.external_urls?.spotify || null,
        })),
      playlists: data.playlists?.items
        ?.filter((item) => item?.name) 
        .map((item) => ({
          name: item.name,
          owner: item.owner?.display_name || "Unknown Owner",
          totalTracks: item.tracks?.total || 0,
          externalUrl: item.external_urls?.spotify || null,
        })),
    };

    return res.json({ message: "Search results fetched successfully!", results });
  } catch (error) {
    handleApiError(error, res, "Failed to perform search");
  }
};

export const getMoodBasedPlaylists = async (req, res) => {
  try {
    const { spotifyToken } = req;
    const { mood = "chill", limit = 10, offset = 0, market = "US" } = req.query;

    const moodMapping = {
      happy: "party",
      sad: "chill",
      energetic: "workout",
      relaxed: "relax",
    };

    const searchQuery = moodMapping[mood] || mood;
    const randomTags = ["mood", "new", "popular"];
    const dynamicQuery = `${searchQuery} ${randomTags[Math.floor(Math.random() * randomTags.length)]}`;

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
      },
      params: {
        q: dynamicQuery,
        type: "playlist",
        market,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
    });

    const playlists = data.playlists.items
      .filter((playlist) => playlist && playlist.name)
      .map((playlist) => ({
        name: playlist.name || "Untitled Playlist",
        description: playlist.description || "No description available.",
        externalUrl: playlist.external_urls?.spotify || null,
        image: playlist.images?.[0]?.url || null,
        owner: playlist.owner?.display_name || "Unknown",
        totalTracks: playlist.tracks?.total || 0,
      }));

    res.json({
      message: `Playlists for mood: ${mood} fetched successfully!`,
      mood,
      playlists,
    });
  } catch (error) {
    handleApiError(error, res, "Failed to fetch mood-based playlists");
  }
};

export const getNewReleases = async (req, res) => {
  try {
    const { spotifyToken } = req;

    const { limit =50, offset= 0, country = "LB"} = req.query;

    const { data } = await axios.get("https://api.spotify.com/v1/browse/new-releases",{
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
      },
      params: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        country,
      }
    });

    const albums = data.albums.items.map((album) => ({
      name: album.name,
      artists: album.artists.map((artist) => artist.name),
      album_id: album.id,
      uri: album.uri,
      releaseDate: album.release_date,
      totalTracks: album.total_tracks,
      externalUrl: album.external_urls.spotify,
      image: album.images,
    }));

    res.json({
      message: "New releases fetched successfully!",
      total: data.albums.total,
      limit: data.albums.limit,
      offset: data.albums.offset,
      next: data.albums.next,
      previous: data.albums.previous,
      albums,
      //albumss: data.albums,
    });
  } catch (error) {
    console.error("Error fetching new releases:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
    }

    res.status(500).json({ message: "Failed to fetch new releases." });
  }
};
