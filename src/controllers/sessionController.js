import Session from "../../models/Session.js";
import Room from "../../models/Room.js";
import { Op } from 'sequelize';
import JoinedUsers from "../../models/JoinedUsers.js";
import User from "../../models/User.js";


const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.findAll({
            include: [{
                model: Room,
                attributes: ['room_id', 'room_type']
            }]
        });
        respond(res, 200, sessions);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch sessions: ${error.message}`);
    }
};

export const getSessionById = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id, {
            include: [{
                model: Room,
                attributes: ['room_id', 'room_type'],
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                }]
            }]
        });

        if (!session) {
            return respond(res, 404, null, 'Session not found');
        }

        respond(res, 200, session);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch session: ${error.message}`);
    }
};

export const createSession = async (req, res) => {
    try {
        const { room_id, session_date, session_start_time, session_end_time } = req.body;

        // Check if room exists
        const room = await Room.findByPk(room_id);
        if (!room) {
            return respond(res, 400, null, 'Room not found');
        }

        // Validate session times
        if (new Date(`1970-01-01T${session_end_time}`) <= new Date(`1970-01-01T${session_start_time}`)) {
            return respond(res, 400, null, 'End time must be after start time');
        }

        const session = await Session.create(req.body);
        respond(res, 201, session, 'Session created successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to create session: ${error.message}`);
    }
};

export const updateSession = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        if (!session) {
            return respond(res, 404, null, 'Session not found');
        }

        // Validate session times if being updated
        if (req.body.session_start_time || req.body.session_end_time) {
            const start = req.body.session_start_time || session.session_start_time;
            const end = req.body.session_end_time || session.session_end_time;

            if (new Date(`1970-01-01T${end}`) <= new Date(`1970-01-01T${start}`)) {
                return respond(res, 400, null, 'End time must be after start time');
            }
        }

        await session.update(req.body);
        respond(res, 200, session, 'Session updated successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to update session: ${error.message}`);
    }
};

export const deleteSession = async (req, res) => {
    try {
        const deleted = await Session.destroy({ where: { session_id: req.params.id } });
        if (!deleted) {
            return respond(res, 404, null, 'Session not found');
        }
        respond(res, 200, null, 'Session deleted successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to delete session: ${error.message}`);
    }
};

export const getSessionsByRoom = async (req, res) => {
    try {
        const sessions = await Session.findAll({
            where: { room_id: req.params.roomId },
            order: [['session_date', 'ASC'], ['session_start_time', 'ASC']]
        });
        respond(res, 200, sessions);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch sessions: ${error.message}`);
    }
};

export const getMySessions = async (req, res) => {
    try {
        const userId = req.user.user_id; // Get current user ID from authentication

        // Step 1: Get all rooms where user is either creator or participant
        const userRooms = await Room.findAll({
            where: {
                [Op.or]: [
                    { room_creator_id: userId },
                    { '$JoinedUsers.user_id$': userId }
                ]
            },
            include: [{
                model: JoinedUsers,
                where: { user_id: userId },
                required: false
            }],
            attributes: ['room_id'],
            raw: true
        });

        if (!userRooms.length) {
            return respond(res, 200, [], 'No sessions found for your rooms');
        }

        const roomIds = userRooms.map(room => room.room_id);

        // Step 2: Get all sessions for these rooms
        const sessions = await Session.findAll({
            where: { room_id: roomIds },
            include: [{
                model: Room,
                attributes: ['room_id', 'room_name', 'room_type'],
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                }]
            }],
            order: [
                ['session_date', 'ASC'],
                ['session_start_time', 'ASC']
            ]
        });

        // Filter out past sessions if needed (optional)
        const currentDate = new Date().toISOString().split('T')[0];
        const upcomingSessions = sessions.filter(session =>
            session.session_date >= currentDate
        );

        respond(res, 200, upcomingSessions);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch your sessions: ${error.message}`);
    }
};