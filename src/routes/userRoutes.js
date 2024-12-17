import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { registerUser, loginUser, googleLogin , getProfile, updateProfile, changePassword} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

router.put("/change-password", authenticate, changePassword);
router.get("/profile", authenticate, getProfile); 
router.put("/profile", authenticate, updateProfile);

export default router;