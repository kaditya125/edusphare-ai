"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const embeddingService_1 = require("./src/ai/embeddingService");
const pineconeService_1 = require("./src/services/pineconeService");
const knowledgeAgent_1 = require("./src/ai/knowledgeAgent");
async function runTest() {
    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('\n2. Testing Embedding Service...');
        const testText = "The Advanced Machine Learning course (CS501) is taught by Dr. Alan Turing in the Computer Science department. It covers neural networks and deep learning.";
        const vector = await (0, embeddingService_1.generateEmbedding)(testText);
        console.log(`✅ Generated embedding vector of length: ${vector.length}`);
        console.log('\n3. Testing Pinecone Upsert...');
        const testDocId = "test_doc_123";
        await (0, pineconeService_1.upsertKnowledgeVectors)([{
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
        const context = await knowledgeAgent_1.CentralKnowledgeAgent.retrieveContext(query, 1);
        console.log('--- Context Retrieved ---');
        console.log(context);
        console.log('-------------------------');
        console.log('\n5. Cleaning up test data...');
        const index = (0, pineconeService_1.getKnowledgeIndex)();
        await index.deleteOne(testDocId);
        console.log('✅ Cleaned up');
        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    }
    catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
runTest();
//# sourceMappingURL=test-pinecone.js.map