// teacherRoutes.js
import express from "express";
import {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getCurrentTeacher
} from "../controllers/teacherController.js";
import {protect} from "../controllers/authController.js";

const router = express.Router();
router.use(protect);

router.get("/", getAllTeachers);
router.get("/me", getCurrentTeacher);
router.get("/:id", getTeacherById);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);  // Changed from PATCH to PUT
router.delete("/:id", deleteTeacher);

export default router;