import { DataTypes } from "sequelize";
import sequelize from "./db.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const Student = sequelize.define("Student", {
    StudentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    GradeID: {
        type: DataTypes.INTEGER,
        references: {
            model: "Grade",
            key: "GradeID",
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
    tableName: "Student",
    timestamps: false,
    hooks: {
        beforeCreate: (student) => {
            // Generate verification code (6 digits)
            student.verificationCode = crypto.randomInt(100000, 999999).toString();
            // Set expiration (1 hour from now)
            student.verificationTokenExpires = new Date(Date.now() + 3600000);
        },
        beforeValidate: (student) => {
            if (student.changed('Email')) {
                student.Email = student.Email.toLowerCase();
            }
        }
    }
});

Student.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.Password);
};

Student.prototype.generateVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = token;
    this.verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour
    return token;
};

export default Student;