import axios from "axios";
import passport from "passport";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

export const spotifySignin = passport.authenticate("spotify", {
  scope: ["user-read-email", "user-read-private", "user-read-playback-state"],
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


const generateJWT = (user) =>
  jwt.sign(
    { spotifyId: user.spotify_id, email: user.email, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

export const getSpotifyPlaylists = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const user = await db.User.findByPk(userId);

    if (!user?.access_token) {
      return res.status(401).json({ message: "Unauthorized: Spotify access token not found" });
    }

    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });

    return res.status(200).json({
      message: "Playlists fetched successfully!",
      playlists: data.items,
    });
  } catch (error) {
    console.error("Error fetching Spotify playlists:", error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Spotify access token expired. Please log in again." });
    }

    return res.status(500).json({ message: "Failed to fetch playlists" });
  }
};