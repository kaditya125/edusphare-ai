import { generateEmbedding } from './embeddingService';
import { queryKnowledge } from '../services/pineconeService';

export class CentralKnowledgeAgent {
  /**
   * Retrieves context from the Vector Database based on a semantic query.
   * @param query The natural language query from the user.
   * @param topK Number of chunks to retrieve.
   * @param filters Optional metadata filters (e.g. { accessLevel: 'public' })
   * @returns Formatted string of context
   */
  static async retrieveContext(query: string, topK: number = 3, filters?: Record<string, any>): Promise<string> {
    try {
      // 1. Convert user query to vector
      const vector = await generateEmbedding(query);
      
      // 2. Query Pinecone
      const matches = await queryKnowledge(vector, topK, filters);
      
      if (!matches || matches.length === 0) {
        return 'No specific internal university knowledge found for this query.';
      }
      
      // 3. Format matches into a readable context string
      const contexts = matches.map((m: any, index: number) => {
        return `[Source ${index + 1} - ${m.metadata?.sourceType}]: ${m.metadata?.content}`;
      });
      
      return contexts.join('\n\n');
    } catch (error) {
      console.error('❌ Error retrieving context from Knowledge Agent:', error);
      return 'Knowledge Base is currently syncing or temporarily unavailable.';
    }
  }
}
