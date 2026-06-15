import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { Document } from '../models/Document';
import User from '../models/User';
import Student from '../models/Student';
import { generateRAGResponseStream } from '../services/groqService';
import mongoose from 'mongoose';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ userId: req.user?.id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, content, persona = 'mentor' } = req.body;
    let currentChatId = chatId;

    // 1. If no chatId, create a new chat thread
    if (!currentChatId) {
      const chat = new Chat({
        userId: req.user?.id,
        title: content.substring(0, 30) + '...'
      });
      await chat.save();
      currentChatId = chat._id;
    }

    // 2. Save User Message
    const userMessage = new Message({
      chatId: currentChatId,
      sender: 'user',
      content
    });
    await userMessage.save();

    // 3. Retrieval (MongoDB Vector Search RAG)
    // First, we generate an embedding for the user's query (mocking the API call for demo)
    const queryEmbedding = new Array(1536).fill(Math.random()); 
    
    // Perform MongoDB Atlas Vector Search
    const docs = await Document.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 10,
          limit: 3
        }
      }
    ]).catch(err => {
      // Fallback to standard find if vector index isn't fully initialized on Atlas
      console.warn('Vector search failed (index might be missing), falling back to standard fetch');
      return Document.find({}).limit(3);
    });

    let context = docs.map(d => `[${d.title}]: ${d.content}`).join('\n\n');

    // Inject personalized user data into the context
    if (req.user?.id) {
      const student = await Student.findOne({ userId: req.user.id });
      if (student) {
        context = `[Personal Student Information]:
Name: ${student.firstName} ${student.lastName}
Department: ${student.department}
Program: ${student.program}
Semester: ${student.currentSemester}
CGPA: ${student.cgpa}
Credits Earned: ${student.creditsEarned}

University Knowledge Base:
${context}`;
      }
    }

    // 4. Call Groq with Streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Fetch previous messages for this chat to maintain context
    const previousMessages = await Message.find({ chatId: currentChatId }).sort({ timestamp: 1 });
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Send the chatId back immediately so the frontend knows where this belongs
    res.write(`data: ${JSON.stringify({ type: 'metadata', chatId: currentChatId })}\n\n`);

    const stream = await generateRAGResponseStream(formattedMessages, context, persona);
    
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
    const aiMessage = new Message({
      chatId: currentChatId,
      sender: 'ai',
      content: fullResponse
    });
    await aiMessage.save();

    // End the stream
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('Send Message Error:', error);
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + (error.stack || error) + '\n');
    if (!res.headersSent) {
      res.status(500).write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
    }
    res.end();
  }
};

export const getUsageAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all chat IDs for the user
    const chats = await Chat.find({ userId }).select('_id');
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
    const recentMessages = await Message.find({
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
      } else {
        previousWeekTotal++;
      }
    });

    let growthPercentage = 0;
    if (previousWeekTotal === 0 && currentWeekTotal > 0) {
      growthPercentage = 100;
    } else if (previousWeekTotal > 0) {
      growthPercentage = Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100);
    }

    // Clean up dates before sending
    const formattedData = currentWeekData.map(({ day, queries }) => ({ day, queries }));

    res.json({
      totalQueries: currentWeekTotal,
      growthPercentage,
      dailyData: formattedData
    });
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
