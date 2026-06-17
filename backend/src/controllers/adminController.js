"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerKnowledgeSync = exports.getKnowledgeSyncStats = void 0;
const express_1 = require("express");
const redisService_1 = require("../services/redisService");
const syncWorker_1 = require("../jobs/workers/syncWorker");
const getKnowledgeSyncStats = async (req, res) => {
    try {
        const stats = await redisService_1.redisConnection.hgetall('knowledge_stats');
        const lastSyncTime = await redisService_1.redisConnection.get('knowledge_last_sync_time');
        res.json({
            lastSyncTime: lastSyncTime || 'Never',
            status: stats.status || 'unknown',
            recordsProcessed: stats.recordsProcessed ? parseInt(stats.recordsProcessed, 10) : 0,
            lastError: stats.lastError || null
        });
    }
    catch (error) {
        console.error('Error fetching sync stats:', error);
        res.status(500).json({ error: 'Failed to fetch sync statistics' });
    }
};
exports.getKnowledgeSyncStats = getKnowledgeSyncStats;
const triggerKnowledgeSync = async (req, res) => {
    try {
        // Run the sync process asynchronously without blocking the response
        (0, syncWorker_1.syncDatabaseToVector)().catch(err => console.error('Sync process failed:', err));
        res.status(200).json({
            success: true,
            message: 'Knowledge synchronization triggered successfully.'
        });
    }
    catch (error) {
        console.error('Error triggering manual sync:', error);
        res.status(500).json({ error: 'Failed to trigger sync job' });
    }
};
exports.triggerKnowledgeSync = triggerKnowledgeSync;
//# sourceMappingURL=adminController.js.map