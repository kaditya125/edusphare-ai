import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getStudentSchedule } from '../controllers/scheduleController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getStudentSchedule);

export default router;
