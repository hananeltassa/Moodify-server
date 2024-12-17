import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/connection.js";
import { init } from "./config/init.js";
import passport from "./config/passport.js";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import spotifyRoutes from "./routes/spotifyRoutes.js";

dotenv.config();

const app = express();

init(app); 

app.use(express.json()); 
app.use(passport.initialize());

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", spotifyRoutes)

const startServer = async () => {
    try {
      await connectDB();

      app.listen(process.env.SERVER_PORT, () => {
        console.log(`Server running on port ${process.env.SERVER_PORT}`);
      });

    } catch (error) {
      console.error("Unable to connect to the database:", error.message);
      process.exit(1); 
    }
  };
  
  startServer();
