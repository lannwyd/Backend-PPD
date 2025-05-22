import UserHistory from "../../models/userHistory.js";
import User from "../../models/User.js";  // Make sure this path is correct

const GET_HISTORY = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows: history } = await UserHistory.findAndCountAll({
            where: { user_id: req.user.user_id },
            order: [['action_timestamp', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            data: history,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const GET_HISTORY_BY_ID = async (req, res) => {
    try {
        const history = await UserHistory.findOne({
            where: {
                user_history_id: req.params.id,
                user_id: req.user.user_id
            }
        });
        if (!history) {
            return res.status(404).json({ message: 'History not found' });
        }
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const DELETE_HISTORY = async (req, res) => {
    try {
        const history = await UserHistory.findOne({
            where: {
                user_history_id: req.params.id,
                user_id: req.user.user_id
            }
        });
        if (!history) {
            return res.status(404).json({ message: 'History not found' });
        }
        await history.destroy();
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const GET_ALL_STUDENT_HISTORY = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows: history } = await UserHistory.findAndCountAll({
            include: [{
                model: User,
                where: { role_id: 1 }, // Only students
                attributes: ['first_name', 'last_name', 'user_id'],
                required: true,
                as: 'user' // Make sure this matches your association alias
            }],
            order: [['action_timestamp', 'DESC']],
            limit,
            offset
        });

        if (!history || history.length === 0) {
            return res.status(200).json({
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalItems: 0
                }
            });
        }

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            data: history,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count
            }
        });
    } catch (error) {
        console.error('Error fetching student history:', error);
        res.status(500).json({
            message: 'Failed to fetch student history',
            error: error.message
        });
    }
}

// Update the export to include the new function
export { GET_HISTORY, GET_HISTORY_BY_ID, DELETE_HISTORY, GET_ALL_STUDENT_HISTORY };

