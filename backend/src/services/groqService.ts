import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { generateEmbedding } from '../ai/embeddingService';
import { queryKnowledge } from '../services/pineconeService';

dotenv.config();

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateRAGResponseStream = async (messages: any[], context: string, persona: string = 'mentor') => {
  let personaInstructions = '';
  
  if (persona === 'mentor') {
    personaInstructions = `You are an Academic Mentor. Focus on study planning, course guidance, and academic policies. Use a highly encouraging and academic tone.
CRITICAL INSTRUCTION: Always provide diverse, fresh, and varied advice. Do not repeat the exact same tips if the user asks multiple times. Try to provide different perspectives and actionable strategies each time.
If the user asks about coding, programming, algorithms, or technical debugging, DO NOT ANSWER the question. Instead, politely explain that you are their Academic Mentor and they should switch to the "Technical Tutor" agent from the top menu for specialized coding assistance. If the user asks about campus facilities or schedules, tell them to switch to the "Campus Info Agent".`;
  } else if (persona === 'tutor') {
    personaInstructions = `You are a Technical Tutor. Focus on explaining coding concepts, algorithms, and technical skills. Provide code snippets where relevant and explain them step-by-step.
CRITICAL INSTRUCTION: If the user asks about study planning, academic policies, or general university guidelines, DO NOT ANSWER. Instead, politely explain that you are a Technical Tutor and they should switch to the "Academic Mentor" agent from the top menu. If they ask about campus facilities, tell them to switch to the "Campus Info Agent".`;
  } else if (persona === 'agent') {
    personaInstructions = `You are a Campus Info Agent. Focus on providing clear, concise information about physical facilities, timetables, events, and campus navigation.
CRITICAL INSTRUCTION: If the user asks about coding or programming, DO NOT ANSWER. Tell them to switch to the "Technical Tutor" agent from the top menu. If they ask about course guidance or academic policies, DO NOT ANSWER. Tell them to switch to the "Academic Mentor" agent.`;
  }

  const systemPrompt = `You are EduSphere AI, a friendly and highly capable university assistant chatbot.
${personaInstructions}

You have access to both the student's personal information and the university's knowledge base in the context below.
Always try to provide a helpful, direct, and conversational answer using this context. 

FORMATTING RULES (CRITICAL):
1. Always format your responses using Markdown.
2. Use headings (##, ###), bullet lists (-), and numbered lists (1.) to break down complex information.
3. Use bold (**text**) for emphasis on important terms or dates.
4. When presenting data like grades, schedules, or statistics, use Markdown Tables.
5. If the user asks for a summary of their attendance, performance, or exam schedule, output a specific JSON code block so the UI can render an interactive card. 
   - For Attendance: Output \`\`\`json\n{ "component": "AttendanceSummary", "attendance": 92 }\n\`\`\` (use actual data from context).
   - For Performance: Output \`\`\`json\n{ "component": "PerformanceAnalysis", "cgpa": 8.7 }\n\`\`\` (use actual data).
   - Only output these JSON blocks when providing the core summary, and you may include conversational text outside the block.

CRITICAL ANTI-HALLUCINATION INSTRUCTION: If the user asks about specific academic data, student names, grades, rankings, or events that are NOT explicitly provided in the Context below, you MUST reply that you do not have that information. DO NOT guess, infer, or make up names or numbers under any circumstances.

Context:
${context}
`;

  const hasImage = messages.some(msg => Array.isArray(msg.content) && msg.content.some((c: any) => c.type === 'image_url'));
  const modelToUse = hasImage ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.1-8b-instant';

  return await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    model: modelToUse,
    temperature: 0.7,
    stream: true,
  });
};

export const generateAITips = async (view: string): Promise<string[]> => {
  const seed = Math.random().toString(36).substring(7);
  let knowledgeContext = "";
  try {
    const queryEmbedding = await generateEmbedding(`Tips and tricks for the ${view} view, platform features`);
    const pineconeMatches = await queryKnowledge(queryEmbedding, 2);
    knowledgeContext = pineconeMatches
      .map((match: any) => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
      .join('\n\n');
  } catch (err) {
    console.warn("Failed to fetch Pinecone context for AI tips", err);
  }

  let systemPrompt = `You are a helpful UI assistant for a university platform called EduSphere AI.
The user is currently on the "${view}" view.
Generate exactly 3 short, highly unique, and actionable tips (1 sentence each) on how to use features in this view.
Be creative and avoid repeating common advice. Think outside the box. (Random seed for uniqueness: ${seed})

University Context for Tips:
${knowledgeContext}

Return the output ONLY as a valid JSON object with a "tips" array. Do not include markdown blocks or any other text.
Example: {"tips": ["Tip 1", "Tip 2", "Tip 3"]}`;

  if (view === 'quote') {
    systemPrompt = `You are a helpful UI assistant for a university platform called EduSphere AI.
Generate exactly 1 short, highly unique, and extremely motivational quote for a university student.
It should be inspiring and encourage them to study hard and achieve their goals. (Random seed for uniqueness: ${seed})

Return the output ONLY as a valid JSON object with a "tips" array containing exactly 1 string.
Example: {"tips": ["The only way to do great work is to love what you do. - Steve Jobs"]}`;
  } else if (view === 'chat_suggestions') {
    systemPrompt = `You are a helpful AI assistant for a university platform called EduSphere AI.
Generate exactly 4 highly relevant, ready-made chat prompts that a university student would ask an AI assistant.
Examples of topics: attendance, exams, syllabus, library, campus events, career advice, assignments.
Make them sound natural, like a user typing a query. Keep them under 10 words each. (Random seed for uniqueness: ${seed})

Return the output ONLY as a valid JSON object with a "tips" array containing exactly 4 strings.
Example: {"tips": ["What is my attendance percentage?", "Find library books on NLP", "When is my next exam?", "Give me a study plan"]}`;
  }

  try {
    const response = await groq.chat.completions.create({
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
  } catch (err) {
    console.error('AI Tips Error:', err);
  }
  
  return ["Try exploring the interface to discover new features.", "Stay organized and keep track of your tasks.", "Use the search bar for quick navigation."];
};
