import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

async function runAudit() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string });
    const indexes = await pc.listIndexes();
    console.log("Indexes:", JSON.stringify(indexes, null, 2));

    const indexName = process.env.PINECONE_INDEX || 'edusphere';
    const index = pc.index(indexName);
    
    const stats = await index.describeIndexStats();
    console.log("Index Stats:", JSON.stringify(stats, null, 2));

    console.log("\nTesting retrieval...");
    // 1024 dimension zeros vector (assuming nomic-embed-text)
    const dummyVector = new Array(768).fill(0); // wait, Nomic is 768. Let's try to query anyway.
    try {
        const queryResponse = await index.query({
        topK: 1,
        vector: dummyVector,
        includeMetadata: true
        });
        console.log("Query Response:", JSON.stringify(queryResponse, null, 2));
    } catch(e) {
        console.log("768 dim query failed, trying 1024...");
        const dummyVector2 = new Array(1024).fill(0);
        const queryResponse = await index.query({
            topK: 1,
            vector: dummyVector2,
            includeMetadata: true
        });
        console.log("Query Response:", JSON.stringify(queryResponse, null, 2));
    }

  } catch (e: any) {
    console.log("Pinecone Audit Error:", e.message);
  }
  process.exit(0);
}

runAudit();
