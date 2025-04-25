import SessionHistory from "../../models/sessionHistory.js";

export const getAllSessionHistories = async (req, res) => {
    try {
        const sessions = await SessionHistory.findAll({
            timeout: 10000,
            attributes: ['SessionID', 'SessionType', 'SessionDate', 'StartTime', 'EndTime', 'RoomID']
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch session histories",
            details: error.message
        });
    }
};

export const getSessionHistoryById = async (req, res) => {
    try {
        const session = await SessionHistory.findByPk(req.params.id);
        if (!session) {
            return res.status(404).json({ error: "Session history not found" });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch session history",
            details: error.message
        });
    }
};

export const createSessionHistory = async (req, res) => {
    try {
        const { SessionType, SessionDate, StartTime, EndTime, RoomID } = req.body;
        if (!SessionType || !SessionDate || !StartTime || !EndTime || !RoomID) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (EndTime <= StartTime) {
            return res.status(400).json({ error: "EndTime must be greater than StartTime" });
        }

        const session = await SessionHistory.create(req.body);
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create session history",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

export const updateSessionHistory = async (req, res) => {
    try {
        if (req.body.EndTime && req.body.StartTime && req.body.EndTime <= req.body.StartTime) {
            return res.status(400).json({ error: "EndTime must be greater than StartTime" });
        }

        const [updated] = await SessionHistory.update(req.body, {
            where: { SessionID: req.params.id },
            timeout: 10000
        });

        if (!updated) {
            return res.status(404).json({ error: "Session history not found" });
        }

        const updatedSession = await SessionHistory.findByPk(req.params.id);
        res.json(updatedSession);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update session history",
            details: error.message
        });
    }
};

export const deleteSessionHistory = async (req, res) => {
    try {
        const deleted = await SessionHistory.destroy({
            where: { SessionID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Session history not found" });
        }

        res.json({ message: "Session history deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete session history",
            details: error.message
        });
    }
};