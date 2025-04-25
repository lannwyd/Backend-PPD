import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Grade = sequelize.define("Grade", {
    GradeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    UniversityName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    DepartmentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PathName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CurrentYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10,
        },
    },
}, {
    tableName: "Grade",
    timestamps: false,
});

export default Grade;