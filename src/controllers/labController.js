import Lab from "../../models/lab.js";

export const getAllLabs = async (req, res) => {
    try {
        const labs = await Lab.findAll({
            timeout: 10000,
            attributes: ['LabID', 'LabTitle', 'TeacherID']
        });
        res.json(labs);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch labs",
            details: error.message
        });
    }
};

export const getLabById = async (req, res) => {
    try {
        const lab = await Lab.findByPk(req.params.id);
        if (!lab) {
            return res.status(404).json({ error: "Lab not found" });
        }
        res.json(lab);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch lab",
            details: error.message
        });
    }
};

export const createLab = async (req, res) => {
    try {
        const { LabTitle, TeacherID } = req.body;
        if (!LabTitle) {
            return res.status(400).json({ error: "LabTitle is required" });
        }

        const lab = await Lab.create(req.body);
        res.status(201).json(lab);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create lab",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

export const updateLab = async (req, res) => {
    try {
        const [updated] = await Lab.update(req.body, {
            where: { LabID: req.params.id },
            timeout: 10000
        });

        if (!updated) {
            return res.status(404).json({ error: "Lab not found" });
        }

        const updatedLab = await Lab.findByPk(req.params.id);
        res.json(updatedLab);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update lab",
            details: error.message
        });
    }
};

export const deleteLab = async (req, res) => {
    try {
        const deleted = await Lab.destroy({
            where: { LabID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Lab not found" });
        }

        res.json({ message: "Lab deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete lab",
            details: error.message
        });
    }
};