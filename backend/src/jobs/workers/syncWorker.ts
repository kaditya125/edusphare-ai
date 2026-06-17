import { redisConnection } from '../../services/redisService';
import mongoose from 'mongoose';
import Course from '../../models/Course';
import Faculty from '../../models/Faculty';
import Student from '../../models/Student';
import Announcement from '../../models/Announcement';
import Schedule from '../../models/Schedule';
import EmbeddingMetadata from '../../models/EmbeddingMetadata';
import { generateEmbedding } from '../../ai/embeddingService';
import { upsertKnowledgeVectors, KnowledgeMetadata } from '../../services/pineconeService';

// To do Delta Sync, we need to know the last sync time.
const LAST_SYNC_KEY = 'knowledge_last_sync_time';

export const syncDatabaseToVector = async () => {
  const syncId = Date.now().toString();
  console.log(`🚀 Starting Knowledge Sync Job ${syncId}...`);
  
  try {
    const lastSyncIso = await redisConnection.get(LAST_SYNC_KEY);
    const lastSyncDate = lastSyncIso ? new Date(lastSyncIso) : new Date(0); // 1970 if never synced
    const currentSyncStart = new Date();
    
    console.log(`Last sync was at: ${lastSyncDate.toISOString()}`);

    const vectorsToUpsert: any[] = [];
    const BATCH_SIZE = 50;

    const chunkArray = <T>(arr: T[], size: number): T[][] => 
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => 
        arr.slice(i * size, i * size + size)
      );

    // 1. Fetch Modified Courses
    const courses = await Course.find({ updatedAt: { $gt: lastSyncDate } }).populate('facultyId');
    const courseChunks = chunkArray(courses, BATCH_SIZE);
    
    for (const chunk of courseChunks) {
      const embeddings = await Promise.all(chunk.map(course => {
        const content = `Course ${course.courseCode}: ${course.title}. ${course.description} Credits: ${course.credits}. Department: ${course.department}.`;
        return generateEmbedding(content).then(embedding => ({
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
        }));
      }));
      vectorsToUpsert.push(...embeddings);
    }

    // 2. Fetch Modified Faculty
    const faculties = await Faculty.find({ updatedAt: { $gt: lastSyncDate } });
    const facultyChunks = chunkArray(faculties, BATCH_SIZE);

    for (const chunk of facultyChunks) {
      const embeddings = await Promise.all(chunk.map(faculty => {
        const content = `Faculty Member: ${faculty.firstName} ${faculty.lastName}. Designation: ${faculty.designation}. Department: ${faculty.department}. Expertise: ${faculty.researchInterests?.join(', ') || 'N/A'}. Bio: ${faculty.bio || 'N/A'}`;
        return generateEmbedding(content).then(embedding => ({
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
        }));
      }));
      vectorsToUpsert.push(...embeddings);
    }

    // 3. Fetch Modified Announcements
    const announcements = await Announcement.find({ updatedAt: { $gt: lastSyncDate } });
    const announcementChunks = chunkArray(announcements, BATCH_SIZE);

    for (const chunk of announcementChunks) {
      const embeddings = await Promise.all(chunk.map(ann => {
        const content = `Announcement: ${ann.title}. ${ann.description}. Date: ${ann.date}. Priority: ${ann.badge}`;
        return generateEmbedding(content).then(embedding => ({
          id: `announcement_${ann._id}`,
          values: embedding,
          metadata: {
            mongoId: ann._id.toString(),
            sourceType: 'notice',
            content,
            accessLevel: 'public',
            lastUpdated: ann.updatedAt.toISOString(),
          }
        }));
      }));
      vectorsToUpsert.push(...embeddings);
    }

    // Upsert all modified records
    if (vectorsToUpsert.length > 0) {
      console.log(`Syncing ${vectorsToUpsert.length} updated records to Pinecone...`);
      await upsertKnowledgeVectors(vectorsToUpsert);

      console.log(`Saving embedding metadata to MongoDB...`);
      const bulkOps = vectorsToUpsert.map(vec => ({
        updateOne: {
          filter: { mongoId: vec.metadata.mongoId },
          update: {
            $set: {
              mongoId: vec.metadata.mongoId,
              sourceType: vec.metadata.sourceType,
              lastEmbedded: currentSyncStart,
              status: 'success' as const
            }
          },
          upsert: true
        }
      }));
      await EmbeddingMetadata.bulkWrite(bulkOps);
    } else {
      console.log(`No new records to sync.`);
    }

    // Update last sync time
    await redisConnection.set(LAST_SYNC_KEY, currentSyncStart.toISOString());
    console.log(`✅ Knowledge Sync Job ${syncId} Completed.`);

    // Record stats in redis for the admin dashboard
    await redisConnection.hset('knowledge_stats', {
      lastSyncTime: currentSyncStart.toISOString(),
      recordsProcessed: vectorsToUpsert.length,
      status: 'success'
    });

  } catch (error) {
    console.error(`❌ Sync Job Failed:`, error);
    await redisConnection.hset('knowledge_stats', {
      status: 'failed',
      lastError: String(error)
    });
    throw error;
  }
};
