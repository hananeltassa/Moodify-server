import express from "express";
import passport from "passport";

const router = express.Router();

// Route to initiate Spotify login
router.get("/login", passport.authenticate("spotify", {
  scope: ["user-read-email", "user-read-private"],
}));

// Callback route for Spotify OAuth
router.get("/callback", (req, res, next) => {
  passport.authenticate("spotify", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Spotify Authentication Failed", error: err });
    }

    // Return the Spotify user object for testing
    return res.status(200).json({
      message: "Spotify Authentication Successful",
      user,
    });
  })(req, res, next);
});

export default router;
