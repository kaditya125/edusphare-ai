import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { generateEmbedding } from './src/ai/embeddingService';
import { upsertKnowledgeVectors, getKnowledgeIndex, queryKnowledge } from './src/services/pineconeService';
import { CentralKnowledgeAgent } from './src/ai/knowledgeAgent';

async function runTest() {
  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    console.log('\n2. Testing Embedding Service...');
    const testText = "The Advanced Machine Learning course (CS501) is taught by Dr. Alan Turing in the Computer Science department. It covers neural networks and deep learning.";
    const vector = await generateEmbedding(testText);
    console.log(`✅ Generated embedding vector of length: ${vector.length}`);

    console.log('\n3. Testing Pinecone Upsert...');
    const testDocId = "test_doc_123";
    await upsertKnowledgeVectors([{
      id: testDocId,
      values: vector,
      metadata: {
        mongoId: testDocId,
        sourceType: 'course',
        content: testText,
        department: 'Computer Science',
        accessLevel: 'public',
        lastUpdated: new Date().toISOString()
      }
    }]);
    
    // Pinecone upserts are eventually consistent, wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n4. Testing Central Knowledge Agent Retrieval...');
    const query = "Who teaches the machine learning course?";
    const context = await CentralKnowledgeAgent.retrieveContext(query, 1);
    console.log('--- Context Retrieved ---');
    console.log(context);
    console.log('-------------------------');

    console.log('\n5. Cleaning up test data...');
    const index = getKnowledgeIndex();
    await index.deleteOne(testDocId as any);
    console.log('✅ Cleaned up');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
