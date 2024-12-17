import express from "express";
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import { 
    getAllUsers, getUserById, deleteUser, updateUserRole, toggleUserBan, getBannedUsers, 
    getSystemAnalytics,
}  from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, checkRole(['admin']));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', toggleUserBan);
router.get('/banned-users', getBannedUsers);

router.get("/analytics", getSystemAnalytics);

export default router;