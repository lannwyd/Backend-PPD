import express from "express";
import {
    getAllGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade
} from "../controllers/gradeController.js";

const router = express.Router();

router.get("/", getAllGrades);
router.get("/:id", getGradeById);
router.post("/", createGrade);
router.patch("/:id", updateGrade); // ✅ Update grade
router.delete("/:id", deleteGrade); // ✅ Delete grade

export default router;
