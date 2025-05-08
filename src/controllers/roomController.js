import Room from "../../models/Room.js";
import User from "../../models/User.js";
import JoinedUsers from "../../models/JoinedUsers.js";

const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                },
                {
                    model: JoinedUsers,
                    include: [{
                        model: User,
                        attributes: ['user_id', 'first_name', 'last_name']
                    }]
                }
            ]
        });
        respond(res, 200, rooms);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch rooms: ${error.message}`);
    }
};

export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                },
                {
                    model: JoinedUsers,
                    include: [{
                        model: User,
                        attributes: ['user_id', 'first_name', 'last_name']
                    }]
                }
            ]
        });

        if (!room) {
            return respond(res, 404, null, 'Room not found');
        }

        respond(res, 200, room);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch room: ${error.message}`);
    }
};

export const createRoom = async (req, res) => {
    try {
        const { room_creator_id, room_type } = req.body;

        // Validate room type
        if (!['individual', 'public'].includes(room_type)) {
            return respond(res, 400, null, 'Invalid room_type. Must be "individual" or "public"');
        }

        // Check if creator exists
        const creator = await User.findByPk(room_creator_id);
        if (!creator) {
            return respond(res, 400, null, 'Creator user not found');
        }

        const room = await Room.create(req.body);

        // Add creator to joined users
        await JoinedUsers.create({
            user_id: room_creator_id,
            room_id: room.room_id
        });

        respond(res, 201, room, 'Room created successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to create room: ${error.message}`);
    }
};

export const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByPk(req.params.id);
        if (!room) {
            return respond(res, 404, null, 'Room not found');
        }

        // Prevent changing room type if it would affect existing users
        if (req.body.room_type && req.body.room_type !== room.room_type) {
            return respond(res, 400, null, 'Cannot change room type after creation');
        }

        await room.update(req.body);
        respond(res, 200, room, 'Room updated successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to update room: ${error.message}`);
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const deleted = await Room.destroy({ where: { room_id: req.params.id } });
        if (!deleted) {
            return respond(res, 404, null, 'Room not found');
        }

        // Also delete all joined users for this room
        await JoinedUsers.destroy({ where: { room_id: req.params.id } });

        respond(res, 200, null, 'Room deleted successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to delete room: ${error.message}`);
    }
};

export const addUserToRoom = async (req, res) => {
    try {
        const { user_id } = req.body;
        const { id: room_id } = req.params;

        // Check if room exists
        const room = await Room.findByPk(room_id);
        if (!room) {
            return respond(res, 404, null, 'Room not found');
        }

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return respond(res, 404, null, 'User not found');
        }

        // Check if user is already in room
        const existingJoin = await JoinedUsers.findOne({
            where: { user_id, room_id }
        });
        if (existingJoin) {
            return respond(res, 400, null, 'User already in this room');
        }

        const joinedUser = await JoinedUsers.create({ user_id, room_id });
        respond(res, 201, joinedUser, 'User added to room successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to add user to room: ${error.message}`);
    }
};

export const removeUserFromRoom = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { id: room_id } = req.params;

        const deleted = await JoinedUsers.destroy({
            where: { user_id, room_id }
        });

        if (!deleted) {
            return respond(res, 404, null, 'User not found in this room');
        }

        respond(res, 200, null, 'User removed from room successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to remove user from room: ${error.message}`);
    }
};

export const getMyRooms = async (req, res) => {
    try {
        const userId = req.user.user_id; // Assuming user is authenticated and user_id is available

        // Get rooms where user is the creator
        const createdRooms = await Room.findAll({
            where: { room_creator_id: userId },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                },
                {
                    model: JoinedUsers,
                    include: [{
                        model: User,
                        attributes: ['user_id', 'first_name', 'last_name']
                    }]
                }
            ]
        });

        // Get rooms where user is a participant (but not the creator)
        const joinedRooms = await Room.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['user_id', 'first_name', 'last_name']
                },
                {
                    model: JoinedUsers,
                    where: { user_id: userId },
                    include: [{
                        model: User,
                        attributes: ['user_id', 'first_name', 'last_name']
                    }]
                }
            ]
        });

        // Filter out rooms where user is both creator and participant (to avoid duplicates)
        const joinedRoomsFiltered = joinedRooms.filter(room =>
            room.room_creator_id !== userId
        );

        // Combine both lists
        const allRooms = [...createdRooms, ...joinedRoomsFiltered];

        respond(res, 200, allRooms);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch user rooms: ${error.message}`);
    }
};