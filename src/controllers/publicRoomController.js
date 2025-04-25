import PublicRoom from "../../models/PublicRoom.js";

export const getAllPublicRooms = async (req, res) => {
    try {
        const rooms = await PublicRoom.findAll({
            timeout: 10000,
            attributes: ['RoomID', 'TeacherID', 'JoinedStudentsIDList', 'CreationDate']
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch public rooms",
            details: error.message
        });
    }
};

export const getPublicRoomById = async (req, res) => {
    try {
        const room = await PublicRoom.findByPk(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Public room not found" });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch public room",
            details: error.message
        });
    }
};

export const createPublicRoom = async (req, res) => {
    try {
        const { TeacherID } = req.body;
        if (!TeacherID) {
            return res.status(400).json({ error: "TeacherID is required" });
        }

        const room = await PublicRoom.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create public room",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

export const updatePublicRoom = async (req, res) => {
    try {
        const [updated] = await PublicRoom.update(req.body, {
            where: { RoomID: req.params.id },
            timeout: 10000
        });

        if (!updated) {
            return res.status(404).json({ error: "Public room not found" });
        }

        const updatedRoom = await PublicRoom.findByPk(req.params.id);
        res.json(updatedRoom);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update public room",
            details: error.message
        });
    }
};

export const deletePublicRoom = async (req, res) => {
    try {
        const deleted = await PublicRoom.destroy({
            where: { RoomID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Public room not found" });
        }

        res.json({ message: "Public room deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete public room",
            details: error.message
        });
    }
};