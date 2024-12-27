import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import admin from "../config/firebase.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, birthday, gender } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const allowedGenders = ["male", "female", "prefer not to say"];
    if (gender && !allowedGenders.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    if (birthday && isNaN(Date.parse(birthday))) {
      return res.status(400).json({ error: "Invalid birthday format. Use YYYY-MM-DD." });
    }

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
      name,
      email,
      password: hashedPassword,
      birthday: birthday || null,
      gender: gender || null,
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        birthday: newUser.birthday,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const lowerCaseEmail = email.toLowerCase();

    const user = await db.User.findOne({ where: { email: lowerCaseEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET, 
      { expiresIn: "1h" } 
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Google ID token is required." });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { uid, email, name, picture } = decodedToken;

    let user = await db.User.findOne({ where: { email } });

    if (!user) {
      user = await db.User.create({
        name,
        email,
        google_id: uid,
        profile_picture: picture,
        password: null, 
        role: "user", 
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; 

    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] }, 
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, gender, profile_picture } = req.body;

    if (!name && !gender && !profile_picture) {
      return res.status(400).json({ error: "At least one field must be provided for update." });
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (profile_picture) user.profile_picture = profile_picture;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }

    const userId = req.user.id;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};