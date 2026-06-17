import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
export declare const getPineconeClient: () => Pinecone;
export interface KnowledgeMetadata extends RecordMetadata {
    mongoId: string;
    sourceType: string;
    content: string;
    department?: string;
    accessLevel: string;
    lastUpdated: string;
}
export declare const getKnowledgeIndex: () => import("@pinecone-database/pinecone").Index<KnowledgeMetadata>;
/**
 * Upsert vectors into Pinecone
 */
export declare const upsertKnowledgeVectors: (vectors: {
    id: string;
    values: number[];
    metadata: KnowledgeMetadata;
}[]) => Promise<void>;
/**
 * Delete vectors by their original Mongo IDs
 */
export declare const deleteKnowledgeVectors: (mongoIds: string[]) => Promise<void>;
/**
 * Perform similarity search with metadata filtering
 */
export declare const queryKnowledge: (vector: number[], topK?: number, filter?: Record<string, any>) => Promise<import("@pinecone-database/pinecone").ScoredPineconeRecord<KnowledgeMetadata>[]>;
//# sourceMappingURL=pineconeService.d.ts.map