/**
 * Initializes the Transformers.js embedding model (bge-large-en-v1.5)
 */
export declare function initEmbeddingService(): Promise<void>;
/**
 * Generates a 1024-dimensional vector embedding for a given text.
 * @param text The string to embed
 * @returns Array of numbers (the vector)
 */
export declare function generateEmbedding(text: string): Promise<number[]>;
//# sourceMappingURL=embeddingService.d.ts.map