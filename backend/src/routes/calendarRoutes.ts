import express from 'express';
import { getEvents, optimizeSchedule, exportICS } from '../controllers/calendarController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/events', getEvents);
router.post('/ai-optimize', optimizeSchedule);
router.get('/export', exportICS);

export default router;
