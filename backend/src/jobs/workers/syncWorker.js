"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabaseToVector = void 0;
const redisService_1 = require("../../services/redisService");
const mongoose_1 = __importDefault(require("mongoose"));
const Course_1 = __importDefault(require("../../models/Course"));
const Faculty_1 = __importDefault(require("../../models/Faculty"));
const Student_1 = __importDefault(require("../../models/Student"));
const Announcement_1 = __importDefault(require("../../models/Announcement"));
const Schedule_1 = __importDefault(require("../../models/Schedule"));
const embeddingService_1 = require("../../ai/embeddingService");
const pineconeService_1 = require("../../services/pineconeService");
// To do Delta Sync, we need to know the last sync time.
const LAST_SYNC_KEY = 'knowledge_last_sync_time';
const syncDatabaseToVector = async () => {
    const syncId = Date.now().toString();
    console.log(`🚀 Starting Knowledge Sync Job ${syncId}...`);
    try {
        const lastSyncIso = await redisService_1.redisConnection.get(LAST_SYNC_KEY);
        const lastSyncDate = lastSyncIso ? new Date(lastSyncIso) : new Date(0); // 1970 if never synced
        const currentSyncStart = new Date();
        console.log(`Last sync was at: ${lastSyncDate.toISOString()}`);
        const vectorsToUpsert = [];
        // 1. Fetch Modified Courses
        const courses = await Course_1.default.find({ updatedAt: { $gt: lastSyncDate } }).populate('facultyId');
        for (const course of courses) {
            const content = `Course ${course.courseCode}: ${course.title}. ${course.description} Credits: ${course.credits}. Department: ${course.department}.`;
            const embedding = await (0, embeddingService_1.generateEmbedding)(content);
            vectorsToUpsert.push({
                id: `course_${course._id}`,
                values: embedding,
                metadata: {
                    mongoId: course._id.toString(),
                    sourceType: 'course',
                    content,
                    department: course.department,
                    accessLevel: 'public',
                    lastUpdated: course.updatedAt.toISOString(),
                }
            });
        }
        // 2. Fetch Modified Faculty
        const faculties = await Faculty_1.default.find({ updatedAt: { $gt: lastSyncDate } });
        for (const faculty of faculties) {
            const content = `Faculty Member: ${faculty.firstName} ${faculty.lastName}. Designation: ${faculty.designation}. Department: ${faculty.department}. Expertise: ${faculty.expertise?.join(', ') || 'N/A'}. Bio: ${faculty.bio || 'N/A'}`;
            const embedding = await (0, embeddingService_1.generateEmbedding)(content);
            vectorsToUpsert.push({
                id: `faculty_${faculty._id}`,
                values: embedding,
                metadata: {
                    mongoId: faculty._id.toString(),
                    sourceType: 'faculty',
                    content,
                    department: faculty.department,
                    accessLevel: 'public',
                    lastUpdated: faculty.updatedAt.toISOString(),
                }
            });
        }
        // 3. Fetch Modified Announcements
        const announcements = await Announcement_1.default.find({ updatedAt: { $gt: lastSyncDate } });
        for (const ann of announcements) {
            const content = `Announcement: ${ann.title}. ${ann.description}. Date: ${ann.date}. Priority: ${ann.badge}`;
            const embedding = await (0, embeddingService_1.generateEmbedding)(content);
            vectorsToUpsert.push({
                id: `announcement_${ann._id}`,
                values: embedding,
                metadata: {
                    mongoId: ann._id.toString(),
                    sourceType: 'notice',
                    content,
                    accessLevel: 'public',
                    lastUpdated: ann.updatedAt.toISOString(),
                }
            });
        }
        // Upsert all modified records
        if (vectorsToUpsert.length > 0) {
            console.log(`Syncing ${vectorsToUpsert.length} updated records to Pinecone...`);
            await (0, pineconeService_1.upsertKnowledgeVectors)(vectorsToUpsert);
        }
        else {
            console.log(`No new records to sync.`);
        }
        // Update last sync time
        await redisService_1.redisConnection.set(LAST_SYNC_KEY, currentSyncStart.toISOString());
        console.log(`✅ Knowledge Sync Job ${syncId} Completed.`);
        // Record stats in redis for the admin dashboard
        await redisService_1.redisConnection.hset('knowledge_stats', {
            lastSyncTime: currentSyncStart.toISOString(),
            recordsProcessed: vectorsToUpsert.length,
            status: 'success'
        });
    }
    catch (error) {
        console.error(`❌ Sync Job Failed:`, error);
        await redisService_1.redisConnection.hset('knowledge_stats', {
            status: 'failed',
            lastError: String(error)
        });
        throw error;
    }
};
exports.syncDatabaseToVector = syncDatabaseToVector;
//# sourceMappingURL=syncWorker.js.map