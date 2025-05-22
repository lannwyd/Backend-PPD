import express from 'express';
import { protect } from '../controllers/authController.js';
import { GET_HISTORY, GET_HISTORY_BY_ID, DELETE_HISTORY } from '../controllers/historyController.js';

const router = express.Router();

router.use(protect); // This will protect all routes below

router.get('/', GET_HISTORY);
router.get('/:id', GET_HISTORY_BY_ID);
router.delete('/:id', DELETE_HISTORY);

export default router;