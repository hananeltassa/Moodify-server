import db from "../models/index.js";

export const spotifyAuthMiddleware = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const user = await db.User.findByPk(userId);

        if(!user || !user.access_token){
            return res.status(401).json({message: "Unauthorized: Spotify access token not found" });
        }

        req.spotifyToken = user.access_token;
        req.userId = userId; 
        next();
    } catch (error) {
        console.error("Spotify Auth Middleware Error:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};