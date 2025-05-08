import express from "express";
import {
    getAllBoards,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    getRoomsByBoard
} from "../controllers/boardController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get("/", getAllBoards);
router.get("/:id", getBoardById);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

// Board-specific rooms
router.get("/:id/rooms", getRoomsByBoard);

export default router;