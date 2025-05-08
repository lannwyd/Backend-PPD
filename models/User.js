import { DataTypes } from "sequelize";
import sequelize from "./db.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const User = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        validate: {
            is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        set(value) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('password', hash);
            this.setDataValue('salt', salt);
        }
    },
    salt: {
        type: DataTypes.STRING(255),
    },
    profile_picture: {
        type: DataTypes.STRING(255),
    },
    role_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "Role",
            key: "role_id",
        },
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_token: {
        type: DataTypes.STRING
    },
    verification_code: {
        type: DataTypes.STRING(6)
    },
    verification_token_expires: {
        type: DataTypes.DATE
    }
}, {
    tableName: "User",
    timestamps: false,
    hooks: {
        beforeCreate: (user) => {
            user.verification_code = crypto.randomInt(100000, 999999).toString();
            user.verification_token_expires = new Date(Date.now() + 3600000);
        },
        beforeValidate: (user) => {
            if (user.changed('email')) {
                user.email = user.email.toLowerCase();
            }
        }
    }
});

User.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.generateVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verification_token = token;
    this.verification_token_expires = new Date(Date.now() + 3600000);
    return token;
};

// Add this to your User model after the definition
User.associate = function(models) {
    User.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
    });
};


export default User;