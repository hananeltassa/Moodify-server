import passport from "passport";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

// Generate JWT token
const generateJWT = (user) =>
  jwt.sign(
    { spotifyId: user.spotify_id, email: user.email, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

// Test: Initiate Spotify Sign-In
export const testSpotifySignin = passport.authenticate("spotify", {
  scope: ["user-read-email", "user-read-private", "user-library-read", "user-read-playback-state"],
});

// Test: Handle Spotify Callback
export const testSpotifyCallback = (req, res, next) => {
  passport.authenticate("spotify", { session: false }, async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Spotify Authentication Failed" });
    }

    try {
      let existingUser = await db.User.findOne({
        where: { spotify_id: user.spotifyId },
      });

      // Check if user exists by email if Spotify ID doesn't match
      if (!existingUser && user.email) {
        existingUser = await db.User.findOne({
          where: { email: user.email },
        });
      }

      // Update existing user or create a new one
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

      // Generate JWT token
      const token = generateJWT(existingUser);

      // Respond with user details and token
      return res.json({
        message: "Spotify Authentication Successful",
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

