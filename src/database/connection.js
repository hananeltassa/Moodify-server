import { sequelize } from "../models/index.js";

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL using Sequelize.");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error.message);
    process.exit(1); 
  }
};

export default connectDB;
