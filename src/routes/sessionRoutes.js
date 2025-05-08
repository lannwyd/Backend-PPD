import express from "express";
import {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
    getSessionsByRoom,
    getMySessions
} from "../controllers/sessionController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllSessions);
router.get("/my-sessions", protect, getMySessions);
router.get("/:id", getSessionById);
router.post("/", createSession);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

// Room-specific sessions
router.get("/room/:roomId", getSessionsByRoom);

export default router;