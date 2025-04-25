import express from "express";
import {
    getAllPublicRooms,
    getPublicRoomById,
    createPublicRoom,
    updatePublicRoom,
    deletePublicRoom
} from "../controllers/publicRoomController.js";

const router = express.Router();

router.get("/", getAllPublicRooms);
router.get("/:id", getPublicRoomById);
router.post("/", createPublicRoom);
router.put("/:id", updatePublicRoom);
router.delete("/:id", deletePublicRoom);

export default router;