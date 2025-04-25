import express from "express";
import {
    getAllOccupations,
    getOccupationById,
    createOccupation,
    updateOccupation,
    deleteOccupation
} from "../controllers/occupationController.js";

const occupationRouter = express.Router();

occupationRouter.get("/", getAllOccupations);
occupationRouter.get("/:id", getOccupationById);
occupationRouter.post("/", createOccupation);
occupationRouter.patch("/:id", updateOccupation); // ✅ Update occupation
occupationRouter.delete("/:id", deleteOccupation); // ✅ Delete occupation

export default occupationRouter;
