import Occupation from "./occupation.js";
import  sequelize  from "./db.js"; // Adjust the path if necessary
import { DataTypes } from "sequelize";


const PublicRoom = sequelize.define("PublicRoom", {
    RoomID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    TeacherID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Teacher",
            key: "TeacherID",
        },
    },
    JoinedStudentsIDList: {
        type: DataTypes.JSON,
    },
    CreationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "PublicRoom",
    timestamps: false,
});
export default PublicRoom;
