import Teacher from "../../models/Teacher.js";

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            timeout: 10000,
            attributes: ['TeacherID', 'FirstName', 'LastName', 'Email']
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch teachers",
            details: error.message
        });
    }
};

export const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch teacher",
            details: error.message
        });
    }
};

export const createTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create teacher",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

// teacherController.js
// In teacherController.js - update the updateTeacher function
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                status: 'fail',
                error: "Teacher not found"
            });
        }

        // Create update data object (exclude Email if needed)
        const updateData = {
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            Phone: req.body.Phone
        };

        await teacher.update(updateData);

        // Fetch updated teacher with selected attributes
        const updatedTeacher = await Teacher.findByPk(req.params.id, {
            attributes: ['TeacherID', 'FirstName', 'LastName', 'Email', 'Phone']
        });

        res.status(200).json({
            status: 'success',
            data: updatedTeacher.get({ plain: true })
        });
    } catch (error) {
        console.error("Update teacher error:", error);
        res.status(400).json({
            status: 'error',
            error: "Failed to update teacher",
            details: error.message
        });
    }
};

export const deleteTeacher = async (req, res) => {
    try {
        const deleted = await Teacher.destroy({
            where: { TeacherID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.json({ message: "Teacher deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete teacher",
            details: error.message
        });
    }
};

export const getCurrentTeacher = async (req, res) => {
    try {
        console.log("Current teacher ID:", req.user.TeacherID);

        const teacher = await Teacher.findByPk(req.user.TeacherID, {
            attributes: ['TeacherID', 'FirstName', 'LastName', 'Email', 'Phone']
        });

        if (!teacher) {
            return res.status(404).json({
                status: 'fail',
                error: "Teacher not found"
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: teacher.get({ plain: true })
            }
        });
    } catch (error) {
        console.error("Error in getCurrentTeacher:", error);
        res.status(500).json({
            status: 'error',
            error: "Failed to fetch teacher",
            details: error.message
        });
    }
};