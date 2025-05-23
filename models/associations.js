import User from './User.js';
import Role from './Role.js';

import Session from './Session.js';
import JoinedUsers from './JoinedUsers.js';

import UserHistory from './userHistory.js';


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

    // User to JoinedUsers (One-to-Many)
    User.hasMany(JoinedUsers, {
        foreignKey: 'user_id',
        as: 'roomMemberships'
    });

    JoinedUsers.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // JOINED USERS <-> SESSION
    JoinedUsers.belongsTo(Session, {
        foreignKey: 'session_id',
        as: 'session'
    });

    Session.hasMany(JoinedUsers, {
        foreignKey: 'session_id',
        as: 'participants'
    });

    // User to UserHistory (One-to-Many)
    User.hasMany(UserHistory, {
        foreignKey: 'user_id',
        as: 'history'
    });

    UserHistory.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });
}


export default setupAssociations;