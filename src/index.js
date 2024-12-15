import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import { init } from "./config/init.js";
import db from './models/index.js';
dotenv.config();

const app = express();

init(app); 

app.use(express.json()); 

const startServer = async () => {
    try {
      // Test Sequelize database connection
      await sequelize.authenticate();
      console.log("Connected to PostgreSQL using Sequelize.");
  
      // Start server
      app.listen(process.env.SERVER_PORT, () => {
        console.log(`Server running on port ${process.env.SERVER_PORT}`);
      });

      //console.log(db.User === db.sequelize.models.User); 

    } catch (error) {
      console.error("Unable to connect to the database:", error.message);
      process.exit(1); 
    }
  };
  
  startServer();
