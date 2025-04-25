import { DataTypes } from "sequelize";
import sequelize from "./db.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const Teacher = sequelize.define("Teacher", {
    TeacherID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // Added auto-increment like Student
    },
    FirstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    LastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        set(value) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('Password', hash);
            this.setDataValue('Salt', salt);
        }
    },
    Salt: {
        type: DataTypes.STRING(255),
    },
    Phone: {
        type: DataTypes.STRING,
        validate: {
            is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
        }
    },
    OccupationID: {
        type: DataTypes.INTEGER,
        references: {
            model: "Occupation",
            key: "OccupationID",
        },
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: {
        type: DataTypes.STRING
    },
    verificationCode: {
        type: DataTypes.STRING(6)
    },
    verificationTokenExpires: {
        type: DataTypes.DATE
    }
}, {
    tableName: "Teacher",
    timestamps: false,
    hooks: {
        beforeCreate: (teacher) => {
            teacher.verificationCode = crypto.randomInt(100000, 999999).toString();
            teacher.verificationTokenExpires = new Date(Date.now() + 3600000);
        },
        beforeValidate: (teacher) => {
            if (teacher.changed('Email')) {
                teacher.Email = teacher.Email.toLowerCase();
            }
        }
    }
});

// Changed to async/await like Student model
Teacher.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.Password);
};

Teacher.prototype.generateVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = token;
    this.verificationTokenExpires = new Date(Date.now() + 3600000);
    return token;
};

export default Teacher;