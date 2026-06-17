import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getEvents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const optimizeSchedule: (req: AuthRequest, res: Response) => Promise<void>;
export declare const exportICS: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=calendarController.d.ts.map