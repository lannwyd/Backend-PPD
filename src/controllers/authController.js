import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {sendEmail} from '../utils/email.js';
import User from "../../models/User.js";
import Role from "../../models/Role.js"; // Add this import
import dotenv from 'dotenv';

dotenv.config();


const signToken = (id, role) => {
    return jwt.sign({
        id,
        role,
        iat: Date.now()
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const role = user.role_id === 2 ? 'teacher' : 'student';
    const token = signToken(user.user_id, role);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    };

    res.cookie('jwt', token, cookieOptions);

    const userData = user.get({ plain: true });
    delete userData.password;
    delete userData.salt;

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
        const { first_name, last_name, email, password, role } = req.body;

        // Validate input
        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({
                status: 'error',
                error: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                error: 'Email already in use'
            });
        }

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password,
            role_id: role === 'teacher' ? 2 : 1, // Assuming 1=student, 2=teacher
            is_verified: false
        });

        // Send verification email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Your Verification Code',
                message: `Your verification code is: <strong>${user.verification_code}</strong><br>
        It will expire in 1 hour.`
            });

            res.status(201).json({
                status: 'success',
                message: 'Verification code sent to email',
                data: {
                    email: user.email,
                    role
                }
            });
        } catch (emailError) {
            await user.destroy();
            return res.status(500).json({
                status: 'error',
                error: 'Failed to send verification email'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            status: 'error',
            error: 'Registration failed',
            message: error.message
        });
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Check verification code
        if (user.verification_code !== code.trim()) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Check expiration
        if (new Date() > user.verification_token_expires) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        // Mark as verified
        await user.update({
            is_verified: true,
            verification_code: null,
            verification_token_expires: null
        });

        // Create token
        const token = signToken(user.user_id, user.role_id === 2 ? 'teacher' : 'student');

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role_id: user.role_id
                },
                role: user.role_id === 2 ? 'teacher' : 'student'
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            error: 'Email verification failed',
            details: error.message
        });
    }
};


export const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Please provide email, password, and role' });
        }

        // Find user by email with the correct include using the 'as' alias
        const user = await User.findOne({
            where: {
                email: email.toLowerCase()
            },
            include: [{
                model: Role,
                as: 'role', // Add this line to match your association alias
                attributes: ['role_id', 'role_label']
            }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        // Verify password
        const isPasswordCorrect = await user.verifyPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        // Check verification status
        if (!user.is_verified) {
            return res.status(401).json({
                error: 'Account not verified',
                unverified: true
            });
        }

        // Determine user's role from the associated Role model
        const userRole = user.role.role_label.toLowerCase();

        // Check if the user's role matches the requested role
        if (userRole !== role.toLowerCase()) {
            return res.status(403).json({
                error: 'You do not have permission to access this role'
            });
        }

        // Create token
        const token = signToken(user.user_id, userRole);

        // Set cookie
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        };

        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role_id: user.role_id
                },
                role: userRole
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
};


export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Generate new verification code
        user.verification_code = crypto.randomInt(100000, 999999).toString();
        user.verification_token_expires = new Date(Date.now() + 3600000);
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Your New Verification Code',
            message: `Your new verification code is: <strong>${user.verification_code}</strong><br>
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        if (!user.is_verified) {
            return res.status(401).json({
                error: 'Account not verified',
                unverified: true
            });
        }

        req.user = user.get({ plain: true });
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
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
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
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
                email: user.email,
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
        const { password } = req.body;

        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token is invalid or has expired' });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        // Create and send token
        const token = signToken(user.user_id, user.role_id === 2 ? 'teacher' : 'student');

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        };

        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }
            }
        });
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

        const user = await User.findByPk(req.user.user_id);
        if (!user || !(await user.verifyPassword(currentPassword))) {
            return res.status(401).json({ error: 'Your current password is wrong' });
        }

        user.password = newPassword;
        await user.save();

        // Create and send token
        const token = signToken(user.user_id, req.role);

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000),
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production', // false in development
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : undefined
        };

        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            token
        });
    } catch (error) {
        res.status(500).json({
            error: 'Password update failed',
            details: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: { exclude: ['password', 'salt', 'verification_code'] },
            include: [{
                model: Role,
                as: 'role',
                attributes: ['role_label']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: user.get({ plain: true }),
                role: req.role
            }
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            details: error.message
        });
    }
};
export const logout = (req, res) => {
    try {
        // Check if cookie exists before trying to clear it
        if (req.cookies?.jwt) {
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};