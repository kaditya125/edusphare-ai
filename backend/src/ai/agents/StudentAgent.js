"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentAgent = void 0;
const knowledgeAgent_1 = require("../knowledgeAgent");
const groqService_1 = require("../../services/groqService");
class StudentAgent {
    static async handle(query, studentContext) {
        // 1. Get internal university knowledge
        const retrievedContext = await knowledgeAgent_1.CentralKnowledgeAgent.retrieveContext(query, 3, {
            accessLevel: { $in: ['public', 'student-only'] }
        });
        // 2. Build the specialized prompt
        const systemPrompt = `You are the EduSphere AI Student Assistant. Your goal is to help students with their coursework, schedule, and general academic inquiries.
Always be encouraging, professional, and clear.
Use the following internal university knowledge to answer the student's question accurately. 
CRITICAL ANTI-HALLUCINATION INSTRUCTION: If the specific academic data, names, grades, or events requested are NOT explicitly provided in the Context below, you MUST state that you do not have that information. DO NOT guess, infer, or make up names or numbers under any circumstances.

UNIVERSITY KNOWLEDGE CONTEXT:
${retrievedContext}

STUDENT PROFILE CONTEXT:
Name: ${studentContext.firstName} ${studentContext.lastName}
Department: ${studentContext.department}
Current Semester: ${studentContext.currentSemester}`;
        const response = await groqService_1.groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
        });
        return response.choices[0]?.message?.content || 'I am unable to assist at the moment.';
    }
}
exports.StudentAgent = StudentAgent;
//# sourceMappingURL=StudentAgent.js.map