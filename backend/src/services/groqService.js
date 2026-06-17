"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAITips = exports.generateRAGResponseStream = exports.groq = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const embeddingService_1 = require("../ai/embeddingService");
const pineconeService_1 = require("../services/pineconeService");
dotenv_1.default.config();
exports.groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY
});
const generateRAGResponseStream = async (messages, context, persona = 'mentor') => {
    let personaInstructions = '';
    if (persona === 'mentor') {
        personaInstructions = `You are an Academic Mentor. Focus on study planning, course guidance, and academic policies. Use a highly encouraging and academic tone.
CRITICAL INSTRUCTION: If the user asks about coding, programming, algorithms, or technical debugging, DO NOT ANSWER the question. Instead, politely explain that you are their Academic Mentor and they should switch to the "Technical Tutor" agent from the top menu for specialized coding assistance. If the user asks about campus facilities or schedules, tell them to switch to the "Campus Info Agent".`;
    }
    else if (persona === 'tutor') {
        personaInstructions = `You are a Technical Tutor. Focus on explaining coding concepts, algorithms, and technical skills. Provide code snippets where relevant and explain them step-by-step.
CRITICAL INSTRUCTION: If the user asks about study planning, academic policies, or general university guidelines, DO NOT ANSWER. Instead, politely explain that you are a Technical Tutor and they should switch to the "Academic Mentor" agent from the top menu. If they ask about campus facilities, tell them to switch to the "Campus Info Agent".`;
    }
    else if (persona === 'agent') {
        personaInstructions = `You are a Campus Info Agent. Focus on providing clear, concise information about physical facilities, timetables, events, and campus navigation.
CRITICAL INSTRUCTION: If the user asks about coding or programming, DO NOT ANSWER. Tell them to switch to the "Technical Tutor" agent from the top menu. If they ask about course guidance or academic policies, DO NOT ANSWER. Tell them to switch to the "Academic Mentor" agent.`;
    }
    const systemPrompt = `You are EduSphere AI, a friendly and highly capable university assistant chatbot.
${personaInstructions}

You have access to both the student's personal information and the university's knowledge base in the context below.
Always try to provide a helpful, direct, and conversational answer using this context. 
If the user asks about something specific like their attendance, timetable, or library books, use the [Personal Student Information] section.

CRITICAL ANTI-HALLUCINATION INSTRUCTION: If the user asks about specific academic data, student names, grades, rankings, or events that are NOT explicitly provided in the Context below, you MUST reply that you do not have that information. DO NOT guess, infer, or make up names or numbers under any circumstances.

Context:
${context}
`;
    return await exports.groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        stream: true,
    });
};
exports.generateRAGResponseStream = generateRAGResponseStream;
const generateAITips = async (view) => {
    const seed = Math.random().toString(36).substring(7);
    let knowledgeContext = "";
    try {
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)(`Tips and tricks for the ${view} view, platform features`);
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 2);
        knowledgeContext = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
    }
    catch (err) {
        console.warn("Failed to fetch Pinecone context for AI tips", err);
    }
    const systemPrompt = `You are a helpful UI assistant for a university platform called EduSphere AI.
The user is currently on the "${view}" view.
Generate exactly 3 short, highly unique, and actionable tips (1 sentence each) on how to use features in this view.
Be creative and avoid repeating common advice. Think outside the box. (Random seed for uniqueness: ${seed})

University Context for Tips:
${knowledgeContext}

Return the output ONLY as a valid JSON object with a "tips" array. Do not include markdown blocks or any other text.
Example: {"tips": ["Tip 1", "Tip 2", "Tip 3"]}`;
    try {
        const response = await exports.groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.9,
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{"tips": []}';
        const parsed = JSON.parse(content);
        if (parsed.tips && Array.isArray(parsed.tips) && parsed.tips.length > 0) {
            return parsed.tips;
        }
    }
    catch (err) {
        console.error('AI Tips Error:', err);
    }
    return ["Try exploring the interface to discover new features.", "Stay organized and keep track of your tasks.", "Use the search bar for quick navigation."];
};
exports.generateAITips = generateAITips;
//# sourceMappingURL=groqService.js.map