import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authenticate = (req, res, next) => {
  try {
    // Debug incoming Authorization header
    //console.log("Authorization Header:", req.headers.authorization);

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Decoded JWT Payload:", decoded);

    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};
