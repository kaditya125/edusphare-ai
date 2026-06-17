"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchedulers = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const syncWorker_1 = require("./workers/syncWorker");
/**
 * Initializes the cron schedules for background workers.
 */
const initSchedulers = () => {
    console.log('⏰ Initializing 12-hour strict knowledge sync cron schedule...');
    // Run every 12 hours (at 00:00 and 12:00)
    node_cron_1.default.schedule('0 0,12 * * *', async () => {
        console.log('🔄 Cron Triggered: Starting 12-hour Knowledge Sync...');
        try {
            await (0, syncWorker_1.syncDatabaseToVector)();
            console.log('✅ Cron Sync Completed Successfully');
        }
        catch (err) {
            console.error('❌ Cron Sync Failed:', err);
        }
    });
};
exports.initSchedulers = initSchedulers;
//# sourceMappingURL=scheduler.js.map