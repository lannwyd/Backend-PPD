import express from "express";
import {
    getAllSessions,
    getSessionById,
    getMySessions
} from "../controllers/sessionController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllSessions);
router.get("/my-sessions", protect, getMySessions);
router.get("/:id", getSessionById);
export default router;