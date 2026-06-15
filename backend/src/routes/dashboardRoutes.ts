import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getPerformanceHistory, getAnnouncements, getRoadmap, search, getStudentSummaryAI, getLeaderboard, getRecentFeedback, getFormalReport, emailReport } from '../controllers/dashboardController';

const router = express.Router();

router.use(authMiddleware);

router.get('/performance-history', getPerformanceHistory);
router.get('/announcements', getAnnouncements);
router.get('/roadmap', getRoadmap);
router.get('/leaderboard', getLeaderboard);
router.get('/feedback', getRecentFeedback);
router.get('/search', search);
router.get('/ai-summary', getStudentSummaryAI);
router.get('/formal-report', getFormalReport);
router.post('/email-report', emailReport);

export default router;
