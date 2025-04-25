// models/individualRoom.js
import { DataTypes } from "sequelize";
import  sequelize  from "./db.js"; // Adjust the path if necessary

const IndividualRoom = sequelize.define("IndividualRoom", {
    RoomID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    StudentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Student",
            key: "StudentID",
        },
    },
    LabID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Lab",
            key: "LabID",
        },
    },
    CreationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "IndividualRoom",
    timestamps: false,
});

export default IndividualRoom;
