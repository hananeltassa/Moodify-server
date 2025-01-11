import db from "../models/index.js";
import { Parser } from "json2csv";


export const getAllUsers = async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: {exclude: ["password"]},
      });
  
      res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching users" });
    }
};

export const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await db.User.findByPk(id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching user" });
    }
};

export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      await user.destroy();
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting user" });
    }
};

export const updateUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.email === "admin@moodify.com") {
        return res.status(403).json({ error: "This user's role cannot be modified." });
      }
  
      user.role = role;
      await user.save();
  
      res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating user role" });
    }
};
  
export const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email === "admin@moodify.com") {
      return res.status(403).json({ error: "This user cannot be banned." });
    }

    user.is_banned = !user.is_banned;
    await user.save();

    return res.status(200).json({
      message: `User has been ${user.is_banned ? "banned" : "unbanned"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Error in toggleUserBan:", error);
    return res.status(500).json({ error: "Error updating user ban status" });
  }
};
  
export const getBannedUsers = async (req, res) => {
    try {
      const bannedUsers = await db.User.findAll({
        where: { is_banned: true },
        attributes: {exclude: ["password"]},
      });
  
      res.status(200).json({ bannedUsers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching banned users" });
    }
};

export const getSystemAnalytics = async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const bannedUsers = await db.User.count({ where: { is_banned: true } });
    const spotifyUsers = await db.User.count({ where: { spotify_id: { [db.Sequelize.Op.ne]: null } } });

    const totalMoodDetections = await db.MoodDetectionInput.count();
    const totalChallenges = await db.Challenge.count();
    const completedChallenges = await db.Challenge.count({ where: { status: "completed" } });

    // Gender Counts
    const maleUsers = await db.User.count({ where: { gender: "male" } });
    const femaleUsers = await db.User.count({ where: { gender: "female" } });
    const preferNotToSayUsers = await db.User.count({ where: { gender: "prefer not to say" } });

    // Previous Data
    const previousUsers = 2;
    const previousBannedUsers = 0;
    const previousSpotifyUsers = 0;
    const previousChallenges = 2;
    const previousCompletedChallenges = 7;
    const previousMoodDetections = 0;
    const previousMaleUsers = 1;
    const previousFemaleUsers = 1;
    const previousPreferNotToSayUsers = 0;

    const analytics = {
      users: {
        total: totalUsers,
        previous_total: previousUsers,
        banned: bannedUsers,
        previous_banned: previousBannedUsers,
        spotify_connected: spotifyUsers,
        previous_spotify_connected: previousSpotifyUsers,
        gender: {
          male: maleUsers,
          previous_male: previousMaleUsers,
          female: femaleUsers,
          previous_female: previousFemaleUsers,
          prefer_not_to_say: preferNotToSayUsers,
          previous_prefer_not_to_say: previousPreferNotToSayUsers,
        },
      },
      mood_detections: {
        total: totalMoodDetections,
        previous_total: previousMoodDetections,
      },
      challenges: {
        total: totalChallenges,
        previous_total: previousChallenges,
        completed: completedChallenges,
        previous_completed: previousCompletedChallenges,
      },
    };

    res.status(200).json({ analytics });
  } catch (error) {
    console.error("Error fetching system analytics:", error.message);
    res.status(500).json({ error: "Error retrieving system analytics." });
  }
};



export const exportUsers = async (req, res) => {
  try{
    const { format = "csv"} = req.query;

    const users = await db.User.findAll({
      attributes: {exclude: ["password"] },
      raw: true,
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found to export." });
    }

    if (format === "csv") {
      const fields = Object.keys(users[0]); // Extract column headers
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(users);

      res.header("Content-Type", "text/csv");
      res.attachment("users.csv");
      return res.send(csv);
    }

    // Default: Export as JSON
    res.header("Content-Type", "application/json");
    return res.status(200).json({ users });

  } catch(error){
    console.error("Error exporting user data:", error.message);
    return res.status(500).json({ error: "Error exporting user data." });
  }
};

