import cron from 'node-cron';
import { syncDatabaseToVector } from './workers/syncWorker';
/**
 * Initializes the cron schedules for background workers.
 */
export const initSchedulers = () => {
  console.log('⏰ Initializing 12-hour strict knowledge sync cron schedule...');

  // Run every 12 hours (at 00:00 and 12:00)
  cron.schedule('0 0,12 * * *', async () => {
    console.log('🔄 Cron Triggered: Starting 12-hour Knowledge Sync...');
    try {
      await syncDatabaseToVector();
      console.log('✅ Cron Sync Completed Successfully');
    } catch (err) {
      console.error('❌ Cron Sync Failed:', err);
    }
  });
};
