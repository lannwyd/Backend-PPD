import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Session = sequelize.define("Session", {
    session_id: {
        type: DataTypes.STRING,
        primaryKey: true,
     
    },
    session_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255],
        },
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255],
        },
    },
    session_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    session_start_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    session_end_time: {
        type: DataTypes.TIME,
        allowNull: true,
        validate: {
            isAfterStartTime(value) {
                if (value <= this.session_start_time) {
                    throw new Error("EndTime must be greater than StartTime");
                }
            },
        },
    },

    
}, {
    tableName: "Session",
    timestamps: false,
});

export default Session;