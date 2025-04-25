import Grade from "../../models/grade.js";

export const getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.findAll({
            timeout: 10000,
            attributes: ['GradeID', 'UniversityName', 'DepartmentName', 'PathName']
        });
        res.json(grades);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch grades",
            details: error.message
        });
    }
};

export const getGradeById = async (req, res) => {
    try {
        const grade = await Grade.findByPk(req.params.id);
        if (!grade) {
            return res.status(404).json({ error: "Grade not found" });
        }
        res.json(grade);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch grade",
            details: error.message
        });
    }
};

export const createGrade = async (req, res) => {
    try {
        const { UniversityName, DepartmentName, PathName, CurrentYear } = req.body;
        if (!UniversityName || !DepartmentName || !PathName || !CurrentYear) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const grade = await Grade.create(req.body);
        res.status(201).json(grade);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create grade",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

export const updateGrade = async (req, res) => {
    try {
        const [updated] = await Grade.update(req.body, {
            where: { GradeID: req.params.id },
            timeout: 10000
        });

        if (!updated) {
            return res.status(404).json({ error: "Grade not found" });
        }

        const updatedGrade = await Grade.findByPk(req.params.id);
        res.json(updatedGrade);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update grade",
            details: error.message
        });
    }
};

export const deleteGrade = async (req, res) => {
    try {
        const deleted = await Grade.destroy({
            where: { GradeID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Grade not found" });
        }

        res.json({ message: "Grade deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete grade",
            details: error.message
        });
    }
};