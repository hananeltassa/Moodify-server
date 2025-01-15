import db from "../models/index.js";
import { Parser } from "json2csv";
import { Op, Sequelize } from "sequelize";

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
  try{
    const totalUsers = await db.User.count();
    const bannedUsers = await db.User.count({ where: { is_banned: true }});
    const spotifyUsers = await db.User.count({ where : {spotify_id: { [db.Sequelize.Op.ne]: null }}});
    
    //console.log("Loaded Models:", Object.keys(db));

    const totalMoodDetections = await db.MoodDetectionInput.count();

    const totalChallenges = await db.Challenge.count();
    const completedChallenges = await db.Challenge.count({ where: {status: "completed"}});
    const pendingChallenges = await db.Challenge.count({ where: {status: "pending"}});
    const rejectedChallenges = await db.Challenge.count({ where: {status: "rejected"}});


    // Gender Counts
    const maleUsers = await db.User.count({ where: { gender: "male" } });
    const femaleUsers = await db.User.count({ where: { gender: "female" } });
    const preferNotToSayUsers = await db.User.count({ where: { gender: "prefer not to say" } });

    const analytics = {
      users: {
        total: totalUsers,
        banned: bannedUsers,
        spotify_connected: spotifyUsers,
        gender: {
          male: maleUsers,
          female: femaleUsers,
          prefer_not_to_say: preferNotToSayUsers,
        },
      },
      mood_detections:{
        total: totalMoodDetections,
      },
      challenges:{
        total: totalChallenges,
        completed: completedChallenges,
        pending: pendingChallenges,
        rejected: rejectedChallenges,
      },
    };

    res.status(200).json({ analytics});                                             
  } catch (error){
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


export const getUserGrowthPerDay = async (req, res) => {
  try {
    const { startDate, endDate, all } = req.query;

    // Define where clause based on query parameters
    const whereClause = all
      ? {}
      : {
          created_at: {
            [Sequelize.Op.between]: [
              startDate || new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
              endDate || new Date(),
            ],
          },
        };

    const userGrowth = await db.User.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("created_at")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "user_count"],
      ],
      where: whereClause,
      group: [Sequelize.fn("DATE", Sequelize.col("created_at"))], 
      order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    res.status(200).json({ userGrowth });
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    res.status(500).json({ error: "Error retrieving user growth data." });
  }
};

export const getMoodInsightsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate and parse date range
    const whereClause = {};
    if (startDate) {
      whereClause.createdAt = { [db.Sequelize.Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [db.Sequelize.Op.lte]: new Date(endDate),
      };
    }

    // Total mood detections by date
    const detectionsByDate = await db.MoodDetectionInput.findAll({
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'],
        [db.Sequelize.fn('COUNT', '*'), 'count'],
      ],
      where: whereClause,
      group: ['date'],
      order: [[db.Sequelize.literal('date'), 'ASC']],
    });

    // Detections grouped by mood and date
    const detectionsByMoodAndDate = await db.MoodDetectionInput.findAll({
      attributes: [
        [db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'],
        'detected_mood',
        [db.Sequelize.fn('COUNT', '*'), 'count'],
      ],
      where: whereClause,
      group: ['date', 'detected_mood'],
      order: [[db.Sequelize.literal('date'), 'ASC']],
    });

    // Format results for charts
    const formattedDetectionsByDate = detectionsByDate.map((entry) => ({
      date: entry.get('date'),
      count: parseInt(entry.get('count'), 10),
    }));

    const formattedDetectionsByMoodAndDate = detectionsByMoodAndDate.map((entry) => ({
      date: entry.get('date'),
      mood: entry.detected_mood,
      count: parseInt(entry.get('count'), 10),
    }));

    const insights = {
      detectionsByDate: formattedDetectionsByDate,
      detectionsByMoodAndDate: formattedDetectionsByMoodAndDate,
    };

    res.status(200).json({ insights });
  } catch (error) {
    console.error('Error fetching mood insights by date:', error.message);
    res.status(500).json({ error: 'Error retrieving mood insights by date.' });
  }
};

export const getMoodAndInputTypeStats = async (req, res) => {
  try {
    // Get total counts grouped by mood
    const moodsStats = await db.MoodDetectionInput.findAll({
      attributes: [
        'detected_mood',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('detected_mood')), 'total'],
      ],
      group: ['detected_mood'],
    });

    // Get total counts grouped by input type
    const inputTypeStats = await db.MoodDetectionInput.findAll({
      attributes: [
        'input_type',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('input_type')), 'total'],
      ],
      group: ['input_type'],
    });

    // Format response
    const moodCounts = moodsStats.map((item) => ({
      mood: item.detected_mood,
      total: parseInt(item.get('total'), 10),
    }));

    const inputTypeCounts = inputTypeStats.map((item) => ({
      inputType: item.input_type,
      total: parseInt(item.get('total'), 10),
    }));

    res.status(200).json({
      moodCounts,
      inputTypeCounts,
    });
  } catch (error) {
    console.error('Error fetching mood and input type stats:', error.message);
    res.status(500).json({ error: 'Error fetching statistics.' });
  }
};