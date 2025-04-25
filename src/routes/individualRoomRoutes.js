import express from "express";
import {
    getAllIndividualRooms,
    getIndividualRoomById,
    createIndividualRoom,
    updateIndividualRoom,
    deleteIndividualRoom
} from "../controllers/individualRoomController.js";

const router = express.Router();

router.get("/", getAllIndividualRooms);
router.get("/:id", getIndividualRoomById);
router.post("/", createIndividualRoom);
router.put("/:id", updateIndividualRoom);
router.delete("/:id", deleteIndividualRoom);

export default router;