import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Room = sequelize.define("Room", {
    room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    room_creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "user_id",
        },
    },
    room_type: {
        type: DataTypes.ENUM('individual', 'public'),
        allowNull: false,
    },
    board_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "Board",
            key: "board_id",
        },
    },
}, {
    tableName: "Room",
    timestamps: false,
});

export default Room;