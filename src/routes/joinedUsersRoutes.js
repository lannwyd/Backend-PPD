import express from "express";
import {
    getJoinedUsersByRoom,
    getRoomsByUser,
    joinUserToRoom,
    leaveRoom,
    removeUserFromRoom
} from "../controllers/joinedUsersController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

// Get all users in a specific room
router.get("/room/:roomId/users", getJoinedUsersByRoom);

// Get all rooms for a specific user
router.get("/user/:userId/rooms", getRoomsByUser);

// Join/leave room endpoints
router.post("/join", joinUserToRoom);
router.delete("/leave/:roomId", leaveRoom);

// Admin-only endpoint
router.delete("/:roomId/users/:userId", removeUserFromRoom);

export default router;