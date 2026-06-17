"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSyncJob = exports.syncQueue = exports.SYNC_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redisService_1 = require("../services/redisService");
exports.SYNC_QUEUE_NAME = 'knowledge-sync-queue';
exports.syncQueue = new bullmq_1.Queue(exports.SYNC_QUEUE_NAME, {
    connection: redisService_1.redisConnection,
});
/**
 * Add a job to sync knowledge base.
 */
const addSyncJob = async () => {
    return await exports.syncQueue.add('syncDatabaseToVector', {}, {
        removeOnComplete: true,
        removeOnFail: 10,
    });
};
exports.addSyncJob = addSyncJob;
//# sourceMappingURL=queues.js.map