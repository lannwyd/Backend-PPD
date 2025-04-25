// models/sessionHistory.js
import { DataTypes } from "sequelize";
import  sequelize  from "./db.js"; // Adjust the path if necessary

const SessionHistory = sequelize.define("SessionHistory", {
    SessionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    SessionType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [["Public", "Private"]],
        },
    },
    SessionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    StartTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    EndTime: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            isAfterStartTime(value) {
                if (value <= this.StartTime) {
                    throw new Error("EndTime must be greater than StartTime");
                }
            },
        },
    },
    SessionResultList: {
        type: DataTypes.TEXT,
    },
    LastExecutedCode: {
        type: DataTypes.TEXT,
    },
    RoomID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "PublicRoom",
            key: "RoomID",
        },
    },
}, {
    tableName: "SessionHistory",
    timestamps: false,
});

export default SessionHistory;
