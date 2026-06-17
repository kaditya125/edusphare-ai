"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Notice_1 = __importDefault(require("../models/Notice"));
const groqService_1 = require("../services/groqService");
const embeddingService_1 = require("../ai/embeddingService");
const pineconeService_1 = require("../services/pineconeService");
const router = express_1.default.Router();
// Get all notices
router.get('/', async (req, res) => {
    try {
        const notices = await Notice_1.default.find().sort({ createdAt: -1 });
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
    }
    catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});
// AI Chat for a specific notice
router.post('/:id/chat', async (req, res) => {
    try {
        const notice = await Notice_1.default.findById(req.params.id);
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
        // Fetch related university guidelines via Pinecone RAG
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)(notice.title + ' ' + prompt);
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 3);
        const knowledgeContext = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        // Create context for AI
        const context = `[OFFICIAL UNIVERSITY NOTICE]
Title: ${notice.title}
Category: ${notice.category}
Date Issued: ${notice.date}
Priority: ${notice.priority}

Full Description/Body:
${notice.description}

[UNIVERSITY KNOWLEDGE BASE]
${knowledgeContext}

You are an AI assistant helping a student understand this specific university notice.
Be concise, helpful, and answer questions specifically based on the notice provided above, while keeping the University Knowledge Base in mind if they ask broader questions.`;
        const messages = [{ role: 'user', content: prompt }];
        // We can use the 'mentor' persona or a generic one. groqService defaults to 'mentor'
        const stream = await (0, groqService_1.generateRAGResponseStream)(messages, context, 'mentor');
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
    }
    catch (error) {
        console.error('Notice Chat Error:', error);
        if (!res.headersSent) {
            res.status(500).write(`data: ${JSON.stringify({ error: 'Failed to process AI chat' })}\n\n`);
        }
        else {
            res.write(`data: ${JSON.stringify({ error: 'Failed to process AI chat' })}\n\n`);
        }
        res.end();
    }
});
exports.default = router;
//# sourceMappingURL=noticeRoutes.js.map