import User from "../../models/User.js";
import Role from "../../models/Role.js";

// Helper for consistent responses
const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['user_id', 'first_name', 'last_name', 'email', 'role_id', 'is_verified'],
            include: [{
                model: Role,
                attributes: ['role_label']
            }]
        });
        respond(res, 200, users);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch users: ${error.message}`);
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password', 'salt'] },
            include: [{
                model: Role,
                attributes: ['role_label']
            }]
        });

        if (!user) {
            return respond(res, 404, null, 'User not found');
        }

        respond(res, 200, user);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch user: ${error.message}`);
    }
};

export const createUser = async (req, res) => {
    try {
        const { email, role_id } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return respond(res, 400, null, 'Email already in use');
        }

        // Check if role exists
        if (role_id) {
            const role = await Role.findByPk(role_id);
            if (!role) {
                return respond(res, 400, null, 'Invalid role_id');
            }
        }

        const user = await User.create(req.body);
        respond(res, 201, user.get({ plain: true }), 'User created successfully');
    } catch (error) {
        respond(res, 400, null, `Validation error: ${error.message}`);
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.user.user_id; // Get from authenticated user

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                error: 'User ID not provided'
            });
        }

        const allowedFields = ['first_name', 'last_name', 'phone'];
        const updates = {};

        // Validate and filter fields
        for (const field of allowedFields) {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                if (field === 'phone' && req.body.phone) {
                    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
                    if (!phoneRegex.test(req.body.phone)) {
                        return res.status(400).json({
                            status: 'error',
                            error: 'Invalid phone number format'
                        });
                    }
                }
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: 'error',
                error: 'No valid fields provided for update'
            });
        }

        const [affectedRows] = await User.update(updates, {
            where: { user_id: userId }
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found or no changes made'
            });
        }

        // Fixed include statement with 'as' keyword
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'salt', 'verification_code'] },
            include: [{
                model: Role,
                as: 'role', // This must match your association alias
                attributes: ['role_label']
            }]
        });

        return res.status(200).json({
            status: 'success',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({
            status: 'error',
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { user_id: req.params.id } });
        if (!deleted) {
            return respond(res, 404, null, 'User not found');
        }
        respond(res, 200, null, 'User deleted successfully');
    } catch (error) {
        respond(res, 500, null, `Failed to delete user: ${error.message}`);
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: { exclude: ['password', 'salt'] },
            include: [{
                model: Role,
                attributes: ['role_label']
            }]
        });

        if (!user) {
            return respond(res, 404, null, 'User not found');
        }

        respond(res, 200, user);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch user: ${error.message}`);
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.user_id);

        if (!user) {
            return respond(res, 404, null, 'User not found');
        }

        const isMatch = await user.verifyPassword(currentPassword);
        if (!isMatch) {
            return respond(res, 400, null, 'Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();

        respond(res, 200, null, 'Password changed successfully');
    } catch (error) {
        respond(res, 400, null, `Failed to change password: ${error.message}`);
    }
};

// Add this new method to userController.js
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const user = await User.findByPk(req.user.user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profilePicturePath = `/uploads/profile_pictures/${req.file.filename}`;
        await user.update({ profile_picture: profilePicturePath });

        res.status(200).json({
            status: 'success',
            profile_picture: profilePicturePath
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
};