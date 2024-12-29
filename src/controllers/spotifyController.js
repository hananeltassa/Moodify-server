import axios from "axios";
import db from "../models/index.js";
import { handleApiError } from "../utils/handleApiError.js";
import { generateJWT } from "../utils/generateJWT.js";
import { isDataStale } from "../utils/isDataStale.js";


export const spotifyCallback = async (req, res) => {
  const { code, redirectUri, codeVerifier } = req.body;

  if (!code || !redirectUri || !codeVerifier) {
    return res.status(400).json({
      message: 'Missing code, redirectUri, or codeVerifier',
    });
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        code_verifier: codeVerifier,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    const userProfile = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const {
      id: spotifyId,
      display_name: displayName,
      email,
      images,
    } = userProfile.data;

    const profilePic = images?.[0]?.url || null;

    let existingUser = await db.User.findOne({ where: { spotify_id: spotifyId } });

    if (!existingUser && email) {
      existingUser = await db.User.findOne({ where: { email } });
    }

    if (existingUser) {
      existingUser.access_token = access_token;
      existingUser.refresh_token = refresh_token;
      await existingUser.save();
    } else {
      existingUser = await db.User.create({
        name: displayName || 'Spotify User',
        email: email || null,
        password: 'spotify_oauth_user',
        spotify_id: spotifyId,
        access_token,
        refresh_token,
        profile_picture: profilePic,
        role: 'user',
      });
    }

    const token = generateJWT(existingUser);

    return res.status(200).json({
      message: 'Spotify Login Successful!',
      user: {
        id: existingUser.id,
        spotifyId: existingUser.spotify_id,
        name: existingUser.name,
        email: existingUser.email,
        profilePic: existingUser.profile_picture,
        access_token,
        refresh_token,
      },
      token,
    });
  } catch (error) {
    console.error('Error during Spotify token exchange or user saving:', error.response?.data || error.message);

    return res.status(500).json({
      message: 'Failed to authenticate with Spotify.',
      details: error.response?.data || error.message,
    });
  }
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

    const artistGenres = {};

    for (const item of data.items) {
      const track = item.track;

      for (const artist of track.artists) {
        if (!artistGenres[artist.id]) {
          const { data: artistData } = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}`, {
            headers: { Authorization: `Bearer ${spotifyToken}` },
          });
          artistGenres[artist.id] = artistData.genres;
        }
      }

      const combinedGenres = track.artists.flatMap((artist) => artistGenres[artist.id] || []);

      await db.SpotifyGlobalData.upsert({
        type: "track",
        spotify_id: track.id,
        name: track.name,
        metadata: {
          artists: track.artists.map((artist) => ({
            name: artist.name,
            id: artist.id,
            externalUrl: artist.external_urls.spotify,
          })),
          album: {
            name: track.album.name,
            id: track.album.id,
            externalUrl: track.album.external_urls.spotify,
          },
        },
        popularity: track.popularity,
        genre: combinedGenres, 
        release_date: track.album.release_date,
        duration_ms: track.duration_ms,
        external_url: track.external_urls.spotify,
        images: track.album.images,
      });

      for (const artist of track.artists) {
        await db.SpotifyGlobalData.upsert({
          type: "artist",
          spotify_id: artist.id,
          name: artist.name,
          metadata: {
            externalUrl: artist.external_urls.spotify,
          },
          genre: artistGenres[artist.id], 
          followers: null,
        });
      }
    }

    return res.json({
      message: "Tracks with genres fetched successfully!",
      total_tracks: data.total,
      tracks,
    });
  } catch (error) {
    console.error("Error fetching playlist tracks with genres:", error.message);
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

export const refreshSpotifyData = async (req, res) => {
  try {
    const { spotifyToken, userId } = req; 

    const { data: playlistsData } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const playlists = playlistsData.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      images: playlist.images,
      totalTracks: playlist.tracks.total,
    }));

    const { data: likedTracksData } = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const likedTracks = likedTracksData.items.map((item) => ({
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

    await db.SpotifyUserData.upsert({
      user_id: userId,
      playlists,
      liked_songs: likedTracks,
    });

    return res.status(200).json({ message: "Spotify data refreshed successfully!" });
  } catch (error) {
    console.error("Error refreshing Spotify data:", error.message);
    res.status(500).json({ message: "Failed to refresh Spotify data" });
  }
};
