import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Import all models
import User from "./user.js";
import SpotifyUserData from "./spotifyUserData.js";
import MoodDetectionInput from "./moodDetectionInput.js";
import Challenge from "./challenge.js";
import AIMusicSuggestion from "./aimusicSuggestion.js";
import AIChallenge from "./aiChallenge.js";

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
  AIMusicSuggestion: AIMusicSuggestion(sequelize, Sequelize.DataTypes),
  AIChallenge: AIChallenge(sequelize, Sequelize.DataTypes),
};

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export the Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize };
export default db;
