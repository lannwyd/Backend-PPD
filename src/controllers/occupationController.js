import Occupation from "../../models/occupation.js";

export const getAllOccupations = async (req, res) => {
    try {
        const occupations = await Occupation.findAll({
            timeout: 10000,
            attributes: ['OccupationID', 'UniversityName', 'DepartmentName']
        });
        res.json(occupations);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch occupations",
            details: error.message
        });
    }
};

export const getOccupationById = async (req, res) => {
    try {
        const occupation = await Occupation.findByPk(req.params.id);
        if (!occupation) {
            return res.status(404).json({ error: "Occupation not found" });
        }
        res.json(occupation);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch occupation",
            details: error.message
        });
    }
};

export const createOccupation = async (req, res) => {
    try {
        const occupation = await Occupation.create(req.body);
        res.status(201).json(occupation);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create occupation",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

export const updateOccupation = async (req, res) => {
    try {
        const [updated] = await Occupation.update(req.body, {
            where: { OccupationID: req.params.id },
            timeout: 10000
        });

        if (!updated) {
            return res.status(404).json({ error: "Occupation not found" });
        }

        const updatedOccupation = await Occupation.findByPk(req.params.id);
        res.json(updatedOccupation);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update occupation",
            details: error.message
        });
    }
};

export const deleteOccupation = async (req, res) => {
    try {
        const deleted = await Occupation.destroy({
            where: { OccupationID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Occupation not found" });
        }

        res.json({ message: "Occupation deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete occupation",
            details: error.message
        });
    }
};