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

  
  


 



    // Additional direct associations for JoinedUsers
    JoinedUsers.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });


    User.hasMany(JoinedUsers, {
        foreignKey: 'user_id',
        as: 'roomMemberships'
    });

  
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