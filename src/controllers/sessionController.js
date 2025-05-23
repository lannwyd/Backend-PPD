import Session from "../../models/Session.js";
import User from "../../models/User.js";
import JoinedUsers from "../../models/JoinedUsers.js";




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
    const userId = req.user.user_id;
    console.log('userId:', userId);

    // Find all joined sessions for the user via JoinedUsers with included Session
    const joinedSessions = await JoinedUsers.findAll({
      where: { user_id: userId },
      include: {
        model: Session,
        as: 'session',
      },
    });

    if (!joinedSessions || joinedSessions.length === 0) {
      return res.status(404).json({ error: 'No joined sessions found for this user' });
    }

    // Extract just the sessions from the join entries
    const sessions = joinedSessions.map(joined => joined.session);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching joined sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};