import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Student from '../../models/student.js';
import Teacher from '../../models/Teacher.js';
import {sendEmail} from '../utils/email.js';


const signToken = (id, role) => {
    return jwt.sign({
        id,
        role,
        iat: Date.now() // issued at timestamp
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    // More reliable role detection
    const role = user.get('TeacherID') ? 'teacher' : 'student';
    const userId = role === 'student' ? user.StudentID : user.TeacherID;

    const token = signToken(userId, role);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    };

    res.cookie('jwt', token, cookieOptions);

    const userData = user.get({ plain: true });
    delete userData.Password;
    delete userData.Salt;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: userData,
            role
        }
    });
};

export const register = async (req, res, next) => {
    try {
        const { role, ...userData } = req.body;
        let user;

        if (role === 'student') {
            user = await Student.create(userData);
        } else if (role === 'teacher') {
            user = await Teacher.create(userData);
        } else {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid role specified',
                message: 'Role must be either student or teacher'
            });
        }

        const verificationCode = user.verificationCode;

        try {
            await sendEmail({
                email: user.Email,
                subject: 'Your Verification Code',
                message: `Your verification code is: <strong>${verificationCode}</strong><br>
                It will expire in 1 hour.`
            });

            res.status(201).json({
                status: 'success',
                message: 'Verification code sent to email',
                data: {
                    email: user.Email,
                    role
                }
            });
        } catch (emailError) {
            await user.destroy();
            return res.status(500).json({
                status: 'error',
                error: 'Failed to send verification email',
                message: emailError.message
            });
        }
    } catch (error) {
        console.error('Registration error:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                status: 'error',
                error: 'Validation failed',
                messages: error.errors.map(err => err.message)
            });
        }

        res.status(400).json({
            status: 'error',
            error: 'Registration failed',
            message: error.message
        });
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Please provide email, password, and role' });
        }

        let user;
        if (role === 'student') {
            user = await Student.findOne({
                where: { Email: email.toLowerCase() }
            });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({
                where: { Email: email.toLowerCase() }
            });
        } else {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        // Verify password
        const isPasswordCorrect = await user.verifyPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                error: 'Account not verified',
                unverified: true
            });
        }

        createSendToken(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { email, code, role } = req.body;

        let user;
        if (role === 'student') {
            user = await Student.findOne({ where: { Email: email } });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({ where: { Email: email } });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const storedCode = String(user.verificationCode).trim();
        const receivedCode = String(code).trim();

        if (storedCode !== receivedCode) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (new Date() > user.verificationCodeExpires) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        // Update only the necessary fields
        await user.update({
            isVerified: true,
            verificationCode: null,
            verificationCodeExpires: null
        }, {
            fields: ['isVerified', 'verificationCode', 'verificationCodeExpires'],
            silent: true // Prevent hooks from running unnecessarily
        });

        createSendToken(user, 200, res);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            error: 'Email verification failed',
            details: error.message
        });
    }
};

export const resendVerification = async (req, res, next) => {
    try {
        const { email, role } = req.body;

        let user;
        if (role === 'student') {
            user = await Student.findOne({ where: { Email: email } });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({ where: { Email: email } });
        } else {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Generate new code (model hook will do this automatically)
        user.verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        await sendEmail({
            email: user.Email,
            subject: 'Your New Verification Code',
            message: `Your new verification code is: <strong>${user.verificationCode}</strong><br>
            It will expire in 1 hour.`
        });

        res.status(200).json({
            status: 'success',
            message: 'New verification code sent'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to resend verification',
            details: error.message
        });
    }
};

export const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from cookies or headers
        if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        } else if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                error: 'You are not logged in. Please log in to get access.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Find user based on role
        let user;

        // In the protect middleware:
        if (decoded.role === 'student') {
            user = await Student.findByPk(decoded.id);
            if (user) {
                req.user = {
                    StudentID: user.StudentID,
                    ...user.get({ plain: true })
                };
            }
        } else if (decoded.role === 'teacher') {
            user = await Teacher.findByPk(decoded.id);
            if (user) {
                req.user = {
                    TeacherID: user.TeacherID,
                    ...user.get({ plain: true })
                };
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        req.role = decoded.role; // Make sure this is set
        req.user = user.get({ plain: true });
        next();
    } catch (error) {
        console.error('Authentication error:', error); // Debug log
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Your session has expired. Please log in again.',
                expired: true
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token. Please log in again.',
                invalid: true
            });
        }
        res.status(401).json({ error: 'Authentication failed' });
    }
};


// Restrict to certain roles
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return res.status(403).json({ error: 'You do not have permission to perform this action' });
        }
        next();
    };
};


// Forgot password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email, role } = req.body;

        let user;
        if (role === 'student') {
            user = await Student.findOne({ where: { Email: email } });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({ where: { Email: email } });
        } else {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        if (!user) {
            return res.status(404).json({ error: 'There is no user with that email address' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Send email with reset token
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetUrl}`;

        try {
            await sendEmail({
                email: user.Email,
                subject: 'Your password reset token (valid for 10 minutes)',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            return res.status(500).json({ error: 'There was an error sending the email' });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Password reset failed',
            details: error.message
        });
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const { role } = req.body;

        let user;
        if (role === 'student') {
            user = await Student.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: Date.now() }
                }
            });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: Date.now() }
                }
            });
        } else {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        if (!user) {
            return res.status(400).json({ error: 'Token is invalid or has expired' });
        }

        // Update password
        user.Password = req.body.password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            error: 'Password reset failed',
            details: error.message
        });
    }
};

// Update password (for logged-in users)
export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        let user;
        if (req.role === 'student') {
            user = await Student.findByPk(req.user.StudentID);
        } else if (req.role === 'teacher') {
            user = await Teacher.findByPk(req.user.TeacherID);
        }

        if (!user || !user.verifyPassword(currentPassword)) {
            return res.status(401).json({ error: 'Your current password is wrong' });
        }

        user.Password = newPassword;
        await user.save();

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            error: 'Password update failed',
            details: error.message
        });

    }
};

// In authController.js - ensure getProfile returns role
export const getProfile = async (req, res) => {
    try {
        let user;
        if (req.role === 'student') {
            user = await Student.findByPk(req.user.id, {
                attributes: { exclude: ['Password', 'Salt', 'verificationCode'] }
            });
        } else if (req.role === 'teacher') {
            user = await Teacher.findByPk(req.user.id, {
                attributes: { exclude: ['Password', 'Salt', 'verificationCode'] }
            });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: user.get({ plain: true }),
                role: req.role  // Make sure role is included
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch profile',
            details: error.message
        });
    }
};
export const logout = (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ status: 'success' });
};