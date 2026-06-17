"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryKnowledge = exports.deleteKnowledgeVectors = exports.upsertKnowledgeVectors = exports.getKnowledgeIndex = exports.getPineconeClient = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let pineconeClient = null;
const getPineconeClient = () => {
    if (!pineconeClient) {
        pineconeClient = new pinecone_1.Pinecone({
            apiKey: process.env.PINECONE_API_KEY || '',
        });
    }
    return pineconeClient;
};
exports.getPineconeClient = getPineconeClient;
// Index name defined in architecture
const INDEX_NAME = 'university-ai';
const getKnowledgeIndex = () => {
    const pc = (0, exports.getPineconeClient)();
    return pc.Index(INDEX_NAME);
};
exports.getKnowledgeIndex = getKnowledgeIndex;
/**
 * Upsert vectors into Pinecone
 */
const upsertKnowledgeVectors = async (vectors) => {
    if (vectors.length === 0)
        return;
    const index = (0, exports.getKnowledgeIndex)();
    try {
        // Try passing as array (v4+)
        await index.upsert(vectors);
    }
    catch (err) {
        if (err.message && err.message.includes('Must pass in at least 1 record')) {
            // Try passing as options object (older/v7 formats)
            await index.upsert({ records: vectors });
        }
        else {
            throw err;
        }
    }
    console.log(`✅ Upserted ${vectors.length} vectors to Pinecone`);
};
exports.upsertKnowledgeVectors = upsertKnowledgeVectors;
/**
 * Delete vectors by their original Mongo IDs
 */
const deleteKnowledgeVectors = async (mongoIds) => {
    if (mongoIds.length === 0)
        return;
    const index = (0, exports.getKnowledgeIndex)();
    // To delete by filter (mongoId matching)
    // Note: Pinecone free tier supports deleting by ID array, or metadata filter.
    // Wait, deleting by metadata filter might not be supported in free tier indexes depending on the pod type.
    // Standard way is to make the vector ID the same as the mongoId!
    // Assuming vector ID is `prefix_mongoId` or just `mongoId`.
    // For simplicity, we assume vector id == mongoId, or we use deleteMany with filter.
    await index.deleteMany({
        mongoId: { $in: mongoIds }
    });
    console.log(`✅ Deleted vectors for ${mongoIds.length} records`);
};
exports.deleteKnowledgeVectors = deleteKnowledgeVectors;
/**
 * Perform similarity search with metadata filtering
 */
const queryKnowledge = async (vector, topK = 5, filter) => {
    const index = (0, exports.getKnowledgeIndex)();
    const results = await index.query({
        vector,
        topK,
        includeMetadata: true,
        filter,
    });
    return results.matches;
};
exports.queryKnowledge = queryKnowledge;
//# sourceMappingURL=pineconeService.js.map