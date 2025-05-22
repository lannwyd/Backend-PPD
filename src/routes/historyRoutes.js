import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
    GET_HISTORY,
    GET_HISTORY_BY_ID,
    DELETE_HISTORY,
    GET_ALL_STUDENT_HISTORY
} from '../controllers/historyController.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('student'), GET_HISTORY);
router.get('/:id', restrictTo('student'), GET_HISTORY_BY_ID);
router.delete('/:id', restrictTo('student'), DELETE_HISTORY);

router.get('/teacher/all', restrictTo('teacher'), GET_ALL_STUDENT_HISTORY);

export default router;