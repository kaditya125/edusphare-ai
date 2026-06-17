"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeSpeech = exports.getUsageAnalytics = exports.sendMessage = exports.getMessages = exports.getHistory = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = __importDefault(require("../models/Message"));
const Document_1 = require("../models/Document");
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const groqService_1 = require("../services/groqService");
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const AudioCache_1 = __importDefault(require("../models/AudioCache"));
const s3Service_1 = require("../services/s3Service");
const embeddingService_1 = require("../ai/embeddingService");
const pineconeService_1 = require("../services/pineconeService");
const getHistory = async (req, res) => {
    try {
        const chats = await Chat_1.default.find({ userId: req.user?.id }).sort({ updatedAt: -1 });
        res.json(chats);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
exports.getHistory = getHistory;
const getMessages = async (req, res) => {
    try {
        const messages = await Message_1.default.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const { chatId, content, persona = 'mentor' } = req.body;
        let currentChatId = chatId;
        // 1. If no chatId, create a new chat thread
        if (!currentChatId) {
            const chat = new Chat_1.default({
                userId: req.user?.id,
                title: content.substring(0, 30) + '...'
            });
            await chat.save();
            currentChatId = chat._id;
        }
        // 2. Save User Message
        const userMessage = new Message_1.default({
            chatId: currentChatId,
            sender: 'user',
            content
        });
        await userMessage.save();
        // 3. Retrieval (Pinecone Vector Search RAG)
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)(content);
        // Perform Pinecone Search
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 5);
        let context = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        // Inject personalized user data into the context
        if (req.user?.id) {
            const student = await Student_1.default.findOne({ userId: req.user.id });
            if (student) {
                // Fetch top 5 global students to match the UI Leaderboard Widget
                const globalTopStudents = await Student_1.default.find()
                    .select('firstName lastName cgpa department')
                    .sort({ cgpa: -1 })
                    .limit(5);
                const globalLeaderboardText = globalTopStudents.map((s, i) => `${i + 1}. ${s.firstName} ${s.lastName} (${s.department}, CGPA: ${s.cgpa})`).join('\n');
                // Fetch top 3 students in the user's specific department
                const classTopStudents = await Student_1.default.find({ department: student.department })
                    .select('firstName lastName cgpa department')
                    .sort({ cgpa: -1 })
                    .limit(3);
                const classLeaderboardText = classTopStudents.map((s, i) => `${i + 1}. ${s.firstName} ${s.lastName} (CGPA: ${s.cgpa})`).join('\n');
                context = `[Personal Student Information]:
Name: ${student.firstName} ${student.lastName}
Department: ${student.department}
Program: ${student.program}
Semester: ${student.currentSemester}
CGPA: ${student.cgpa}
Credits Earned: ${student.creditsEarned}

[Global University Leaderboard]:
${globalLeaderboardText}

[Class Leaderboard (${student.department})]:
${classLeaderboardText}

University Knowledge Base:
${context}`;
            }
        }
        // 4. Call Groq with Streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Fetch previous messages for this chat to maintain context
        const previousMessages = await Message_1.default.find({ chatId: currentChatId }).sort({ timestamp: 1 });
        const formattedMessages = previousMessages.map(msg => ({
            role: msg.sender === 'ai' ? 'assistant' : 'user',
            content: msg.content
        }));
        // Send the chatId back immediately so the frontend knows where this belongs
        res.write(`data: ${JSON.stringify({ type: 'metadata', chatId: currentChatId })}\n\n`);
        const stream = await (0, groqService_1.generateRAGResponseStream)(formattedMessages, context, persona);
        let fullResponse = '';
        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            fullResponse += token;
            // Stream the token to the client
            if (token) {
                res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
            }
        }
        // 5. Save AI Message
        const aiMessage = new Message_1.default({
            chatId: currentChatId,
            sender: 'ai',
            content: fullResponse
        });
        await aiMessage.save();
        // End the stream
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    }
    catch (error) {
        console.error('Send Message Error:', error);
        require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + (error.stack || error) + '\n');
        if (!res.headersSent) {
            res.status(500).write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
        }
        else {
            res.write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
        }
        res.end();
    }
};
exports.sendMessage = sendMessage;
const getUsageAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get all chat IDs for the user
        const chats = await Chat_1.default.find({ userId }).select('_id');
        const chatIds = chats.map(c => c._id);
        // Calculate dates
        const now = new Date();
        // Start of current week (7 days ago)
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - 6);
        currentWeekStart.setHours(0, 0, 0, 0);
        // Start of previous week (14 days ago)
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);
        // Fetch messages for the last 14 days
        const recentMessages = await Message_1.default.find({
            chatId: { $in: chatIds },
            sender: 'user',
            timestamp: { $gte: previousWeekStart }
        });
        // Process current week stats
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentWeekData = Array(7).fill(0).map((_, i) => {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            return {
                day: dayNames[d.getDay()],
                queries: 0,
                date: d.toDateString() // for matching
            };
        });
        let currentWeekTotal = 0;
        let previousWeekTotal = 0;
        recentMessages.forEach(msg => {
            if (msg.timestamp >= currentWeekStart) {
                currentWeekTotal++;
                const msgDateStr = new Date(msg.timestamp).toDateString();
                const dayEntry = currentWeekData.find(d => d.date === msgDateStr);
                if (dayEntry) {
                    dayEntry.queries++;
                }
            }
            else {
                previousWeekTotal++;
            }
        });
        let growthPercentage = 0;
        if (previousWeekTotal === 0 && currentWeekTotal > 0) {
            growthPercentage = 100;
        }
        else if (previousWeekTotal > 0) {
            growthPercentage = Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100);
        }
        // Clean up dates before sending
        const formattedData = currentWeekData.map(({ day, queries }) => ({ day, queries }));
        res.json({
            totalQueries: currentWeekTotal,
            growthPercentage,
            dailyData: formattedData
        });
    }
    catch (error) {
        console.error('Error fetching usage analytics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUsageAnalytics = getUsageAnalytics;
const synthesizeSpeech = async (req, res) => {
    try {
        const { text, voiceId } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }
        // Default to the user-selected Indian voice ID if no voice ID provided
        const targetVoiceId = voiceId || "sS4ouqpoDeVp4REpSCJj";
        // Configured based on user requirements for professional mature voice
        const voiceSettings = {
            stability: 0.8, // High stability
            similarity_boost: 0.8, // High similarity
            style: 0.1, // Low style exaggeration
            use_speaker_boost: true // Speaker Boost enabled
        };
        // Create a deterministic hash of the text + voice + settings to check cache
        const hashInput = JSON.stringify({ text, voiceId: targetVoiceId, voiceSettings });
        const textHash = crypto_1.default.createHash('sha256').update(hashInput).digest('hex');
        // Check AudioCache
        const cachedAudio = await AudioCache_1.default.findOne({ textHash, voiceId: targetVoiceId });
        if (cachedAudio) {
            // If found, redirect to the cached S3 URL or return JSON.
            // Since frontend expects audio stream directly currently, returning JSON means we need to adjust frontend.
            // But wait! If we return JSON `{ audioUrl: string }`, the frontend can just play that URL.
            // Wait, let's just fetch the file and pipe it, or better: return the URL and let frontend play it.
            // If we change the API to return JSON with { audioUrl: '...' }, the frontend can just do: new Audio(data.audioUrl).
            return res.json({ audioUrl: cachedAudio.s3Url });
        }
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2_5", // Fast multilingual model
                voice_settings: voiceSettings
            })
        });
        if (!response.ok) {
            const err = await response.text();
            console.error("ElevenLabs error:", err);
            return res.status(response.status).json({ error: 'Failed to synthesize speech', details: err });
        }
        // Convert to Buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Upload to S3
        let s3Url = '';
        try {
            const s3Result = await (0, s3Service_1.uploadFileToS3)(buffer, 'audio.mp3', 'audio/mpeg');
            s3Url = s3Result.url;
            // Save to cache
            await AudioCache_1.default.create({
                textHash,
                voiceId: targetVoiceId,
                s3Url
            });
        }
        catch (s3Error) {
            console.error("Failed to upload to S3, falling back to direct stream:", s3Error);
            // Fallback: send directly if S3 fails
            res.setHeader('Content-Type', 'audio/mpeg');
            return res.send(buffer);
        }
        // Return the new S3 URL
        return res.json({ audioUrl: s3Url });
    }
    catch (error) {
        console.error('Error synthesizing speech:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.synthesizeSpeech = synthesizeSpeech;
//# sourceMappingURL=chatController.js.map