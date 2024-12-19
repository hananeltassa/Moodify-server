import axios from "axios";
import passport from "passport";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const generateJWT = (user) =>
  jwt.sign(
    { spotifyId: user.spotify_id, email: user.email, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);

export const spotifySignin = passport.authenticate("spotify", {
  scope: ["user-read-email", "user-read-private","user-library-read", "user-read-playback-state"],
});

export const spotifyCallback = (req, res, next) => {
  passport.authenticate("spotify", { session: false }, async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Spotify Authentication Failed" });
    }

    try {
      let existingUser = await db.User.findOne({
        where: { spotify_id: user.spotifyId },
      });

      if (!existingUser && user.email) {
        existingUser = await db.User.findOne({
          where: { email: user.email },
        });
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
      console.error("Database Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  })(req, res, next);
};

export const getSpotifyPlaylistsUser = async (req, res) => {
    try {
      const { spotifyToken } = req;
      const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });

      const playlists = data.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name, 
        description: playlist.description,
        images: playlist.images, 
        owner: {
          name: playlist.owner.display_name,
          url: playlist.owner.external_urls.spotify,
        },
        totalTracks: playlist.tracks.total, 
        externalUrl: playlist.external_urls.spotify, 
      }));

      return res.status(200).json({
        message: "Playlists fetched successfully!",
        playlists,
        //playlists:data.items,
      });
    } catch (error) {
      console.error("Error fetching Spotify playlists:", error.message);
      
      if (error.response?.status === 401) {
        return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
      }

      return res.status(500).json({ message: "Failed to fetch playlists" });
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
      albums: {
        name: item.track.album.name,
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
    console.error("Error fetching Spotify playlist tracks:", error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
    }

    return res.status(500).json({ message: "Failed to fetch tracks" });
  }
};

export const getUserLikedTracks = async (req, res) => {
  try {

    const { spotifyToken } = req;

    const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks`,{
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const tracks = data.items.map((item) => ({
      name: item.track.name,
      artist: item.track.artists.map((artist) => artist.name),
      album: {
        name: item.track.album.name,
        images: item.track.album.images,
      },
      duration_ms: item.track.duration_ms,
      externalUrl: item.track.external_urls.spotify,
    }));

    return res.json({
      message: "Liked tracks fetched successfully!",
      tracks,
      total_tracks: data.total,
      //tracks: data.items,
    });

  } catch (error){
    console.error("Error fetching liked tracks:", error.message);

    if (error.response?.status === 401){
      return res.status(401).json({ message: "Failed to fetch liked tracks"});
    }
  }
};

export const getUserSavedAlbums = async (req, res) => {
  try{
    const { spotifyToken } = req;

    const {data} = await axios.get(`https://api.spotify.com/v1/me/albums`,{
      headers: { Authorization : `Bearer ${spotifyToken}`}
    });

    const albums = data.items.map((item) => ({
      id: item.album.id,
      name : item.album.name,
      release_date: item.album.release_date,
      artists: item.album.artists.map((artist) => artist.name),
      releaseDate: item.album.release_date,
      totalTracks: item.album.total_tracks,
      images: item.album.images, 
      externalUrl: item.album.external_urls.spotify,
    }))

    return res.json({
      message: "Saved albums fetched successfully!",
      total_albums: data.total,
      albums,
      //albums: data.items,
    });

  } catch (error){
    console.error("Error fetching saved Albums:", error.message);

    if (error.response?.status === 401){
      return res.status(401).json({ message: "Failed to fetch saved Albums"});
    }
  }
};

export const getAlbumTracks = async (req, res) => {
  try {
    const { albumId } = req.params;

    const { spotifyToken } = req;

    const { data } = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const albumTracks = data.items.map((track) => ({
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      duration_ms: track.duration_ms, 
      trackNumber: track.track_number, 
      externalUrl: track.external_urls.spotify, 
    }));


    return res.json({
      message: "Album tracks fetched successfully!",
      total: data.total,
      //tracks: data.items,
      tracks: albumTracks,
    });
  } catch (error) {
    console.error("Error fetching album tracks:", error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
    }
    return res.status(500).json({ message: "Failed to fetch album tracks" });
  }
};

export const searchSpotify = async (req, res) => {
  try{
    const { query, type} = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Query are required." });
    }
    const searchType = type || "track,album,artist,playlist";

    const { spotifyToken } = req;

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
      params: {
        q: query,
        type: searchType,
        limit: 10, 
      },
    });

    const results = {};

    if (data.artists) {
      const limitedArtists = data.artists.items.slice(0, 1);
      results.artists = limitedArtists.map((item) => ({
        name: item.name,
        genres: item.genres || [],
        followers: item.followers?.total || 0,
        externalUrl: item.external_urls.spotify,
      }));
      // results.artists = data.artists.items
      //   .filter((item) => item && item.name) 
      //   .map((item) => ({
      //     name: item.name,
      //     genres: item.genres || [],
      //     followers: item.followers?.total || 0,
      //     externalUrl: item.external_urls?.spotify || null,
      //   }));
    }

    if (data.tracks) {
      results.tracks = data.tracks.items
        .filter((item) => item && item.name) 
        .map((item) => ({
          name: item.name,
          artists: item.artists?.map((artist) => artist.name) || ["Unknown Artist"],
          album: item.album?.name || "Unknown Album",
          externalUrl: item.external_urls?.spotify || null,
        }));
    }

    if (data.albums) {
      results.albums = data.albums.items
        .filter((item) => item && item.name)
        .map((item) => ({
          name: item.name,
          artists: item.artists?.map((artist) => artist.name) || ["Unknown Artist"],
          totalTracks: item.total_tracks || 0,
          releaseDate: item.release_date || "Unknown Date",
          externalUrl: item.external_urls?.spotify || null,
        }));
    }

    if (data.playlists) {
      results.playlists = data.playlists.items
        .filter((item) => item && item.name) 
        .map((item) => ({
          name: item.name,
          owner: item.owner?.display_name || "Unknown Owner",
          totalTracks: item.tracks?.total || 0,
          externalUrl: item.external_urls?.spotify || null,
        }));
    }

    return res.json({
      message: "Search results fetched successfully!",
      results,
    });

  } catch(error){
    console.error("Error performing search:", error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
    }

    return res.status(500).json({ message: "Failed to perform search" });
  }
};