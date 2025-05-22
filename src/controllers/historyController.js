import UserHistory from "../../models/userHistory.js";

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

export { GET_HISTORY, GET_HISTORY_BY_ID, DELETE_HISTORY };