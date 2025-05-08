import express from "express";
import {
    getAllRoles,
    getRoleById
} from "../controllers/roleController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.use(protect);

// Basic role info - read only
router.get("/", getAllRoles);
router.get("/:id", getRoleById);

export default router;