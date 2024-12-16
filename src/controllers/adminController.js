import db from "../models/index.js";


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
  
      user.is_banned = !user.is_banned;
      await user.save();
  
      res.status(200).json({
        message: `User has been ${user.is_banned ? "banned" : "unbanned"} successfully`,
        user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating user ban status" });
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
  