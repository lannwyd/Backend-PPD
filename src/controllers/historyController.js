import History from "../../models/historyModel.js";




const GET_HISTORY = async (req, res) => {
    try {
        const history = await History.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}  
const GET_HISTORY_BY_ID = async (req, res) => {
    try {
        const history = await History.findByPk(req.params.id);
        if (!history) {
            return res.status(404).json({ message: 'History not found' });
        }
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const GET_HISTORY_BY_USER_ID = async (req, res) => {
    try {
        const { user_id } = req.user.id;
        const history = await History.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']],
            limit: 10
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
        const history = await History.findByPk(req.params.id);
        if (!history) {
            return res.status(404).json({ message: 'History not found' });
        }
        await history.destroy();
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { GET_HISTORY, GET_HISTORY_BY_ID, DELETE_HISTORY, GET_HISTORY_BY_USER_ID };
