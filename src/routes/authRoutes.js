// authRoutes.js
import express from "express";
import {
    register,
    login,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    logout,
    protect, getProfile
} from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../authValidator.js";
import {sendEmail} from "../utils/email.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password", protect, updatePassword);
// Add this to your authRoutes.js
router.post('/logout', logout);
// Add to authRoutes.js
router.get('/check', protect, async (req, res) => {
    try {
        let user;
        if (req.role === 'student') {
            user = await Student.findByPk(req.user.id);
        } else if (req.role === 'teacher') {
            user = await Teacher.findByPk(req.user.id);
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({
            isVerified: user.isVerified,
            email: user.Email,
            role: req.role
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check auth status' });
    }
});
export default router;
