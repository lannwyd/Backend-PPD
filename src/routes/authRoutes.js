import express from "express";
import {
    register,
    login,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    getProfile,
    logout,
    protect
} from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../authValidator.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// Protected routes (require authentication)
router.use(protect);

router.get("/profile", getProfile);
router.patch("/update-password", updatePassword);
router.post("/logout", logout);
export default router;