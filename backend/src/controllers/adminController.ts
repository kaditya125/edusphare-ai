import { Request, Response } from 'express';
import { redisConnection } from '../services/redisService';
import { syncDatabaseToVector } from '../jobs/workers/syncWorker';
export const getKnowledgeSyncStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await redisConnection.hgetall('knowledge_stats');
    const lastSyncTime = await redisConnection.get('knowledge_last_sync_time');
    
    res.json({
      lastSyncTime: lastSyncTime || 'Never',
      status: stats.status || 'unknown',
      recordsProcessed: stats.recordsProcessed ? parseInt(stats.recordsProcessed, 10) : 0,
      lastError: stats.lastError || null
    });
  } catch (error) {
    console.error('Error fetching sync stats:', error);
    res.status(500).json({ error: 'Failed to fetch sync statistics' });
  }
};

export const triggerKnowledgeSync = async (req: Request, res: Response) => {
  try {
    // Run the sync process asynchronously without blocking the response
    syncDatabaseToVector().catch(err => console.error('Sync process failed:', err));
    
    res.status(200).json({ 
      success: true, 
      message: 'Knowledge synchronization triggered successfully.' 
    });
  } catch (error: any) {
    console.error('Error triggering manual sync:', error);
    res.status(500).json({ error: 'Failed to trigger sync job' });
  }
};
