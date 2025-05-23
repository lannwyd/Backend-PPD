import Session from "../../models/Session.js";




const respond = (res, status, data, message = '') => {
    const response = { status };
    if (data) response.data = data;
    if (message) response.message = message;
    return res.status(status).json(response);
};

export const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.findAll({
        });
        respond(res, 200, sessions);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch sessions: ${error.message}`);
    }
};

export const getSessionById = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id)
        if (!session) {
            return respond(res, 404, null, 'Session not found');
        }

        respond(res, 200, session);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch session: ${error.message}`);
    }
};


export const getMySessions = async (req, res) => {
    try {
    
        const sessions = await Session.findAll({
            
         
            order: [
                ['session_date', 'ASC'],
                ['session_start_time', 'ASC']
            ]
        });

        // Filter out past sessions if needed (optional)
        const currentDate = new Date().toISOString().split('T')[0];
        const upcomingSessions = sessions.filter(session =>
            session.session_date >= currentDate
        );

        respond(res, 200, upcomingSessions);
    } catch (error) {
        respond(res, 500, null, `Failed to fetch your sessions: ${error.message}`);
    }
};