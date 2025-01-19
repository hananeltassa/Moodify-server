import jwt from "jsonwebtoken";

export const generateJWT = (user) =>
  jwt.sign(
    {
      spotifyId: user.spotify_id,
      email: user.email,
      id: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);
