import { DataTypes } from "sequelize";
import sequelize from "./db.js";


const UserHistory = sequelize.define("UserHistory", {
    user_history_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        DefaultValue: 0,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "User",
            key: "user_id",
        },
    },
    compilation_result: {
        type: DataTypes.ENUM('success', 'failure'),
        allowNull: false,
    },
    ino_file_link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hex_file_link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
   
    action_timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    },

}, {
    tableName: "UserHistory",
    timestamps: false,
});     
export default UserHistory;