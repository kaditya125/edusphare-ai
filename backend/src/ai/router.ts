import { groq } from '../services/groqService';
import { StudentAgent } from './agents/StudentAgent';

// If we had more agents: FacultyAgent, AdmissionAgent, etc.
// import { FacultyAgent } from './agents/FacultyAgent';

export class AgentRouter {
  /**
   * Routes the user query to the appropriate sub-agent based on intent classification.
   */
  static async routeAndExecute(query: string, userContext: any): Promise<string> {
    const classificationPrompt = `Classify the following query into exactly one of these categories:
- STUDENT_ASSISTANT (Coursework, schedule, personal academic info)
- ADMISSION_ASSISTANT (Admission process, fees, eligibility)
- FACULTY_ASSISTANT (Questions from faculty about grading or admin)
- EXAMINATION_ASSISTANT (Exam dates, results)
- GENERAL_INFO (If none of the above fit perfectly)

Reply ONLY with the category name. Do not add any other text.
Query: "${query}"`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: classificationPrompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const category = (response.choices[0]?.message?.content || 'GENERAL_INFO').trim();
    console.log(`[Router] Classified query as: ${category}`);

    // Route to appropriate agent
    switch (category) {
      case 'STUDENT_ASSISTANT':
      case 'GENERAL_INFO':
      case 'EXAMINATION_ASSISTANT':
        // For simplicity right now, the Student Agent handles these using the unified knowledge base
        return await StudentAgent.handle(query, userContext);
      
      // case 'FACULTY_ASSISTANT':
      //   return await FacultyAgent.handle(query, userContext);
        
      default:
        return await StudentAgent.handle(query, userContext);
    }
  }
}
