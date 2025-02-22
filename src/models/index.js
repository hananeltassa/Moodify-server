import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import User from "./user.js";
import SpotifyUserData from "./spotifyuserdata.js";
import MoodDetectionInput from "./mooddetectioninput.js";
import Challenge from "./challenge.js";
import SpotifyGlobalData from "./spotifyglobaldata.js";
import UserGeneralMusicData from "./userGeneralMusicData.js";
import Playlist from "./playlist.js";
import PlaylistSongs from "./playlistSongs.js";

dotenv.config();

// Initialize Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, 
  }
);

// Initialize all models
const db = {
  User: User(sequelize, Sequelize.DataTypes),
  SpotifyUserData: SpotifyUserData(sequelize, Sequelize.DataTypes),
  MoodDetectionInput: MoodDetectionInput(sequelize, Sequelize.DataTypes),
  Challenge: Challenge(sequelize, Sequelize.DataTypes),
  SpotifyGlobalData: SpotifyGlobalData(sequelize, Sequelize.DataTypes),
  UserGeneralMusicData: UserGeneralMusicData(sequelize, Sequelize.DataTypes),
  Playlist: Playlist(sequelize, Sequelize.DataTypes),
  PlaylistSongs: PlaylistSongs(sequelize, Sequelize.DataTypes),
};

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//console.log("Loaded Models:", Object.keys(db));

// Export the Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize };
export default db;
