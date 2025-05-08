import User from './User.js';
import Role from './Role.js';
import Room from './Room.js';
import Session from './Session.js';
import JoinedUsers from './JoinedUsers.js';
import Board from './Board.js';

function setupAssociations() {
    // User to Role (Many-to-One)
    User.belongsTo(Role, {
        foreignKey: 'role_id',
        as: 'role'
    });

    Role.hasMany(User, {
        foreignKey: 'role_id',
        as: 'users'
    });

    // Room to User (Many-to-One for creator)
    Room.belongsTo(User, {
        foreignKey: 'room_creator_id',
        as: 'creator'
    });

    User.hasMany(Room, {
        foreignKey: 'room_creator_id',
        as: 'createdRooms'
    });

    // Room to Board (Many-to-One)
    Room.belongsTo(Board, {
        foreignKey: 'board_id',
        as: 'board'
    });

    Board.hasMany(Room, {
        foreignKey: 'board_id',
        as: 'rooms'
    });

    // Session to Room (Many-to-One)
    Session.belongsTo(Room, {
        foreignKey: 'room_id',
        as: 'room'
    });

    Room.hasMany(Session, {
        foreignKey: 'room_id',
        as: 'sessions'
    });

    // User to Room (Many-to-Many through JoinedUsers)
    User.belongsToMany(Room, {
        through: JoinedUsers,
        foreignKey: 'user_id',
        otherKey: 'room_id',
        as: 'joinedRooms'
    });

    Room.belongsToMany(User, {
        through: JoinedUsers,
        foreignKey: 'room_id',
        otherKey: 'user_id',
        as: 'joinedUsers'
    });

    // Additional direct associations for JoinedUsers
    JoinedUsers.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    JoinedUsers.belongsTo(Room, {
        foreignKey: 'room_id',
        as: 'room'
    });

    User.hasMany(JoinedUsers, {
        foreignKey: 'user_id',
        as: 'roomMemberships'
    });

    Room.hasMany(JoinedUsers, {
        foreignKey: 'room_id',
        as: 'userMemberships'
    });

}

export default setupAssociations;