import express from 'express';
import { getHistory, getMessages, sendMessage, getUsageAnalytics, synthesizeSpeech } from '../controllers/chatController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

router.get('/analytics', getUsageAnalytics);
router.get('/history', getHistory);
router.get('/:chatId/messages', getMessages);
router.post('/message', sendMessage);
router.post('/synthesize', synthesizeSpeech);

export default router;
