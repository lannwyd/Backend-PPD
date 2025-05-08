import Board from "../../models/Board.js";
import Room from "../../models/Room.js";

const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getAllBoards = async (req, res) => {
    try {
        const boards = await Board.findAll({
            include: [{
                model: Room,
                as: 'rooms',
                attributes: ['room_id', 'room_type']
            }]
        });
        respond(res, 200, boards);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch boards: ${error.message}`);
    }
};

export const getBoardById = async (req, res) => {
    try {
        const board = await Board.findByPk(req.params.id, {
            include: [{
                model: Room,
                as: 'rooms',
                include: [{
                    association: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                }]
            }]
        });

        if (!board) {
            return respond(res, 404, null, 'Board not found');
        }

        respond(res, 200, board);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch board: ${error.message}`);
    }
};

export const createBoard = async (req, res) => {
    try {
        const { board_name } = req.body;

        if (!board_name) {
            return respond(res, 400, null, 'Board name is required');
        }

        const board = await Board.create(req.body);
        respond(res, 201, board, 'Board created successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to create board: ${error.message}`);
    }
};

export const updateBoard = async (req, res) => {
    try {
        const board = await Board.findByPk(req.params.id);
        if (!board) {
            return respond(res, 404, null, 'Board not found');
        }

        await board.update(req.body);
        respond(res, 200, board, 'Board updated successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to update board: ${error.message}`);
    }
};

export const deleteBoard = async (req, res) => {
    try {
        const board = await Board.findByPk(req.params.id);
        if (!board) {
            return respond(res, 404, null, 'Board not found');
        }

        // Check if board has any rooms
        const roomsCount = await board.countRooms();
        if (roomsCount > 0) {
            return respond(res, 400, null, 'Cannot delete board with associated rooms');
        }

        await board.destroy();
        respond(res, 200, null, 'Board deleted successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to delete board: ${error.message}`);
    }
};

export const getRoomsByBoard = async (req, res) => {
    try {
        const board = await Board.findByPk(req.params.id);
        if (!board) {
            return respond(res, 404, null, 'Board not found');
        }

        const rooms = await board.getRooms({
            include: [{
                association: 'joinedUsers',
                attributes: ['user_id', 'first_name', 'last_name']
            }]
        });

        respond(res, 200, rooms);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch board rooms: ${error.message}`);
    }
};