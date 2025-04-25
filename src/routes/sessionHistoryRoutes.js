import express from "express";
import {
    getAllSessionHistories,
    getSessionHistoryById,
    createSessionHistory,
    updateSessionHistory,
    deleteSessionHistory
} from "../controllers/sessionHistoryController.js";

const router = express.Router();

router.get("/", getAllSessionHistories);
router.get("/:id", getSessionHistoryById);
router.post("/", createSessionHistory);
router.put("/:id", updateSessionHistory);
router.delete("/:id", deleteSessionHistory);

export default router;