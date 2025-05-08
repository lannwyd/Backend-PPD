import express from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    changePassword
} from "../controllers/userController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/", createUser); // User registration

// Protected routes
router.use(protect);

router.get("/", getAllUsers);
router.get("/me", getCurrentUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/change-password", changePassword);

export default router;