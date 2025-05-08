import express from "express";
import {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    addUserToRoom,
    removeUserFromRoom,
    getMyRooms
} from "../controllers/roomController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllRooms);
router.get("/my-rooms", getMyRooms); // Get rooms for current user
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

// Room membership
router.post("/:id/join", addUserToRoom);
router.delete("/:id/leave", removeUserFromRoom);

export default router;