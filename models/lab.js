// models/lab.js
import { DataTypes } from "sequelize";
import  sequelize  from "./db.js"; // Adjust the path if necessary

const Lab = sequelize.define("Lab", {
    LabID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    LabTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TeacherID: {
        type: DataTypes.INTEGER,
        references: {
            model: "Teacher",
            key: "TeacherID",
        },
    },
    InstructionFile: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: "Lab",
    timestamps: false,
});

export default Lab;
