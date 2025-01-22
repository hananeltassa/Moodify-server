import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT_URI,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      try {
        const user = {
          spotifyId: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || null,
          profilePic: profile.photos?.[0]?.value || null,
          accessToken,
          refreshToken,
          expires_in,
        };
        
        //console.log("Generated User Object:", user);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;