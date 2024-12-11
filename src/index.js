import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { init } from "./config/init.js"; 

dotenv.config();

const app = express();

init(app);

app.use(express.json());

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
  
  connectDB();
});
