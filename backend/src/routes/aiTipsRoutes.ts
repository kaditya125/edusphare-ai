import express from 'express';
import { generateAITips } from '../services/groqService';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const view = req.query.view as string || 'dashboard';
    const tips = await generateAITips(view);
    res.json({ tips });
  } catch (error) {
    console.error('Error generating AI tips:', error);
    res.status(500).json({ error: 'Failed to generate tips' });
  }
});

export default router;
