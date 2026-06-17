import express from 'express';
import { getKnowledgeSyncStats, triggerKnowledgeSync } from '../controllers/adminController';
// In a real app we'd add adminAuthMiddleware here

const router = express.Router();

router.get('/knowledge-sync', getKnowledgeSyncStats);
router.post('/knowledge-sync/trigger', triggerKnowledgeSync);

export default router;
