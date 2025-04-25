import { body, validationResult } from 'express-validator';
import Student from "../models/student.js";
import Teacher from "../models/Teacher.js";

export const validateRegister = [
    body('FirstName').trim().notEmpty().withMessage('First name is required'),
    body('LastName').trim().notEmpty().withMessage('Last name is required'),
    body('Email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .custom(async (email) => {
            // Check both Student and Teacher models for email uniqueness
            const [student, teacher] = await Promise.all([
                Student.findOne({ where: { Email: email } }),
                Teacher.findOne({ where: { Email: email } })
            ]);

            if (student || teacher) {
                throw new Error('Email already in use');
            }
            return true;
        }),
    body('Password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('Phone')
        .optional()
        .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
        .withMessage('Invalid phone number format'),
    body('GradeID').isInt().withMessage('GradeID must be an integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];

export const validateLogin = [
    body('email').trim().notEmpty().isEmail(),
    body('password').trim().notEmpty(),
    (req, res, next) => {
    console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];