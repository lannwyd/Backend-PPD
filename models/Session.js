import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Session = sequelize.define("Session", {
    session_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    session_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    session_start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    session_end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            isAfterStartTime(value) {
                if (value <= this.session_start_time) {
                    throw new Error("EndTime must be greater than StartTime");
                }
            },
        },
    },
    compile_results: {
        type: DataTypes.TEXT,
    },
    code_attempt_link: {
        type: DataTypes.STRING(255),
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Room",
            key: "room_id",
        },
    },
}, {
    tableName: "Session",
    timestamps: false,
});

export default Session;