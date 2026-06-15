import express from 'express';
import Notice from '../models/Notice';
import { generateRAGResponseStream } from '../services/groqService';

const router = express.Router();

// Get all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    // Convert _id to id to match frontend expectation
    const formattedNotices = notices.map(n => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      date: n.date,
      description: n.description,
      priority: n.priority,
      pinned: n.pinned
    }));
    res.json(formattedNotices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// AI Chat for a specific notice
router.post('/:id/chat', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      res.status(404).json({ error: 'Notice not found' });
      return;
    }

    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Create context for AI
    const context = `[OFFICIAL UNIVERSITY NOTICE]
Title: ${notice.title}
Category: ${notice.category}
Date Issued: ${notice.date}
Priority: ${notice.priority}

Full Description/Body:
${notice.description}

You are an AI assistant helping a student understand this specific university notice.
Be concise, helpful, and answer questions specifically based on the notice provided above.`;

    const messages = [{ role: 'user', content: prompt }];
    
    // We can use the 'mentor' persona or a generic one. groqService defaults to 'mentor'
    const stream = await generateRAGResponseStream(messages, context, 'mentor');

    let fullResponse = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      fullResponse += token;
      if (token) {
        res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Notice Chat Error:', error);
    if (!res.headersSent) {
      res.status(500).write(`data: ${JSON.stringify({ error: 'Failed to process AI chat' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Failed to process AI chat' })}\n\n`);
    }
    res.end();
  }
});

export default router;
