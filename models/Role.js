import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const Role = sequelize.define("Role", {
    role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role_label: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    tableName: "Role",
    timestamps: false,
});

export default Role;