// models/occupation.js
import { DataTypes } from "sequelize";
import  sequelize  from "./db.js"; // Adjust the path if necessary

const Occupation = sequelize.define("Occupation", {
    OccupationID: {
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
    Proficiency: {
        type: DataTypes.STRING,
    },
}, {
    tableName: "Occupation",
    timestamps: false,
});

export default Occupation;
