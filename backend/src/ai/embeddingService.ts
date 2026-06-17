import { pipeline, env } from '@xenova/transformers';

// Configure transformers to not download models automatically to cache if not wanted
// or let it cache in node_modules locally.
env.allowLocalModels = false;

// Singleton to hold the pipeline so we don't reload the model on every call
let embeddingPipeline: any = null;

/**
 * Initializes the Transformers.js embedding model (bge-large-en-v1.5)
 */
export async function initEmbeddingService() {
  if (!embeddingPipeline) {
    console.log('🔄 Loading local embedding model (Xenova/bge-large-en-v1.5)...');
    try {
      // Feature extraction pipeline generates embeddings
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/bge-large-en-v1.5');
      console.log('✅ Local embedding model loaded successfully.');
    } catch (error) {
      console.error('❌ Error loading embedding model:', error);
      throw error;
    }
  }
}

/**
 * Generates a 1024-dimensional vector embedding for a given text.
 * @param text The string to embed
 * @returns Array of numbers (the vector)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    await initEmbeddingService();
  }
  
  // Create embedding
  const output = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Extract the flat array of numbers from the Tensor
  return Array.from(output.data);
}
