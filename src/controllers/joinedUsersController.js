import JoinedUsers from "../../models/JoinedUsers.js";
import User from "../../models/User.js";
import Room from "../../models/Room.js";
import { Op } from 'sequelize';

const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getJoinedUsersByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Verify room exists
        const roomExists = await Room.findByPk(roomId);
        if (!roomExists) {
            return respond(res, 404, null, 'Room not found');
        }

        const joinedUsers = await JoinedUsers.findAll({
            where: { room_id: roomId },
            include: [{
                model: User,
                attributes: ['user_id', 'first_name', 'last_name', 'email', 'role_id']
            }],
            order: [['joined_at', 'DESC']] // Newest members first
        });

        respond(res, 200, joinedUsers);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch joined users: ${error.message}`);
    }
};

export const getRoomsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user exists
        const userExists = await User.findByPk(userId);
        if (!userExists) {
            return respond(res, 404, null, 'User not found');
        }

        const joinedRooms = await JoinedUsers.findAll({
            where: { user_id: userId },
            include: [{
                model: Room,
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                }]
            }],
            order: [['joined_at', 'DESC']] // Most recently joined rooms first
        });

        respond(res, 200, joinedRooms);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch user's rooms: ${error.message}`);
    }
};

export const joinUserToRoom = async (req, res) => {
    try {
        const { room_id } = req.body;
        const user_id = req.user.user_id; // Get from authenticated user

        // Check if room exists and is active
        const room = await Room.findOne({
            where: {
                room_id,
                is_active: true
            }
        });
        if (!room) {
            return respond(res, 404, null, 'Room not found or not active');
        }

        // Check if already joined
        const existing = await JoinedUsers.findOne({
            where: { user_id, room_id }
        });
        if (existing) {
            return respond(res, 400, null, 'You are already in this room');
        }

        // Check room capacity (if applicable)
        if (room.max_users) {
            const currentUsers = await JoinedUsers.count({
                where: { room_id }
            });
            if (currentUsers >= room.max_users) {
                return respond(res, 400, null, 'Room has reached maximum capacity');
            }
        }

        const joinedUser = await JoinedUsers.create({
            user_id,
            room_id,
            joined_at: new Date()
        });

        respond(res, 201, joinedUser, 'Joined room successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to join room: ${error.message}`);
    }
};

export const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const user_id = req.user.user_id; // Get from authenticated user

        // Check if user is in the room
        const joinedRecord = await JoinedUsers.findOne({
            where: { user_id, room_id: roomId }
        });
        if (!joinedRecord) {
            return respond(res, 404, null, 'You are not in this room');
        }

        // Prevent creator from leaving (optional)
        const room = await Room.findByPk(roomId);
        if (room && room.room_creator_id === user_id) {
            return respond(res, 403, null, 'Room creator cannot leave the room');
        }

        await joinedRecord.destroy();
        respond(res, 200, null, 'Left room successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to leave room: ${error.message}`);
    }
};

export const removeUserFromRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;
        const currentUserId = req.user.user_id; // Get from authenticated user

        // Verify requesting user has permission (creator or admin)
        const room = await Room.findByPk(roomId);
        if (!room) {
            return respond(res, 404, null, 'Room not found');
        }

        if (room.room_creator_id !== currentUserId) {
            return respond(res, 403, null, 'Only room creator can remove users');
        }

        // Prevent removing creator
        if (room.room_creator_id === userId) {
            return respond(res, 400, null, 'Cannot remove room creator');
        }

        const deleted = await JoinedUsers.destroy({
            where: { user_id: userId, room_id: roomId }
        });

        if (!deleted) {
            return respond(res, 404, null, 'User not found in this room');
        }

        respond(res, 200, null, 'User removed from room successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to remove user from room: ${error.message}`);
    }
};