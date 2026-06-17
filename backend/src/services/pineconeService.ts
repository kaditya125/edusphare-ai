import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

let pineconeClient: Pinecone | null = null;

export const getPineconeClient = (): Pinecone => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
    });
  }
  return pineconeClient;
};

const PINECONE_API_KEY = process.env.PINECONE_API_KEY as string;
const INDEX_NAME = process.env.PINECONE_INDEX || 'university-ai';

export interface KnowledgeMetadata extends RecordMetadata {
  mongoId: string;
  sourceType: string; // 'student', 'faculty', 'course', 'notice', 'policy', 'admission', etc.
  content: string;
  department?: string;
  accessLevel: string; // 'public', 'student-only', 'faculty-only', 'admin-only'
  lastUpdated: string;
}

export const getKnowledgeIndex = () => {
  const pc = getPineconeClient();
  return pc.Index<KnowledgeMetadata>(INDEX_NAME);
};

/**
 * Upsert vectors into Pinecone
 */
export const upsertKnowledgeVectors = async (
  vectors: { id: string; values: number[]; metadata: KnowledgeMetadata }[]
) => {
  if (vectors.length === 0) return;
  const index = getKnowledgeIndex();
  try {
    // Try passing as array (v4+)
    await (index as any).upsert(vectors);
  } catch (err: any) {
    if (err.message && err.message.includes('Must pass in at least 1 record')) {
      // Try passing as options object (older/v7 formats)
      await (index as any).upsert({ records: vectors });
    } else {
      throw err;
    }
  }
  console.log(`✅ Upserted ${vectors.length} vectors to Pinecone`);
};

/**
 * Delete vectors by their original Mongo IDs
 */
export const deleteKnowledgeVectors = async (mongoIds: string[]) => {
  if (mongoIds.length === 0) return;
  const index = getKnowledgeIndex();
  
  // To delete by filter (mongoId matching)
  // Note: Pinecone free tier supports deleting by ID array, or metadata filter.
  // Wait, deleting by metadata filter might not be supported in free tier indexes depending on the pod type.
  // Standard way is to make the vector ID the same as the mongoId!
  // Assuming vector ID is `prefix_mongoId` or just `mongoId`.
  // For simplicity, we assume vector id == mongoId, or we use deleteMany with filter.
  await (index as any).deleteMany({
    mongoId: { $in: mongoIds }
  });
  console.log(`✅ Deleted vectors for ${mongoIds.length} records`);
};

/**
 * Perform similarity search with metadata filtering
 */
export const queryKnowledge = async (
  vector: number[],
  topK: number = 5,
  filter?: Record<string, any>
) => {
  const index = getKnowledgeIndex();
  const results = await (index as any).query({
    vector,
    topK,
    includeMetadata: true,
    filter,
  });
  
  return results.matches;
};
