import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Board = sequelize.define("Board", {
    board_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    board_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    board_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, {
    tableName: "Board",
    timestamps: false,
});

export default Board;