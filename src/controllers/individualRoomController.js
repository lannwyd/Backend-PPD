import IndividualRoom from "../../models/individualRoom.js";

export const getAllIndividualRooms = async (req, res) => {
    try {
        const rooms = await IndividualRoom.findAll({
            timeout: 10000,
            attributes: ['RoomID', 'StudentID', 'LabID', 'CreationDate']
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch individual rooms",
            details: error.message
        });
    }
};

export const getIndividualRoomById = async (req, res) => {
    try {
        const room = await IndividualRoom.findByPk(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Individual room not found" });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch individual room",
            details: error.message
        });
    }
};

export const createIndividualRoom = async (req, res) => {
    try {
        const { StudentID, LabID } = req.body;
        if (!StudentID || !LabID) {
            return res.status(400).json({ error: "StudentID and LabID are required" });
        }

        const room = await IndividualRoom.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({
            error: "Failed to create individual room",
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

export const updateIndividualRoom = async (req, res) => {
    try {
        const [updated] = await IndividualRoom.update(req.body, {
            where: { RoomID: req.params.id },
            timeout: 10000
        });

        if (!updated) {
            return res.status(404).json({ error: "Individual room not found" });
        }

        const updatedRoom = await IndividualRoom.findByPk(req.params.id);
        res.json(updatedRoom);
    } catch (error) {
        res.status(400).json({
            error: "Failed to update individual room",
            details: error.message
        });
    }
};

export const deleteIndividualRoom = async (req, res) => {
    try {
        const deleted = await IndividualRoom.destroy({
            where: { RoomID: req.params.id },
            timeout: 10000
        });

        if (!deleted) {
            return res.status(404).json({ error: "Individual room not found" });
        }

        res.json({ message: "Individual room deleted successfully" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete individual room",
            details: error.message
        });
    }
};