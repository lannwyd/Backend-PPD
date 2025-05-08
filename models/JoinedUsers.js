import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const JoinedUsers = sequelize.define("JoinedUsers", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: "User",
            key: "user_id",
        },
    },
    room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: "Room",
            key: "room_id",
        },
    },
}, {
    tableName: "Joined_Users",
    timestamps: false,
});

export default JoinedUsers;