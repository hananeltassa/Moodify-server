import passport from "passport";
import jwt from "jsonwebtoken";

export const spotifySignin = passport.authenticate("spotify", {
  scope: ["user-read-email", "user-read-private", "user-read-playback-state"],
});

export const spotifyCallback = (req, res, next) => {
  passport.authenticate("spotify", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Spotify Authentication Failed" });
    }

    const token = generateJWT(user);
    res.json({
      message: "Spotify Login Successful!",
      user,
      token,
    });
  })(req, res, next);
};


const generateJWT = (user) =>
  jwt.sign(
    { spotifyId: user.spotifyId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);
