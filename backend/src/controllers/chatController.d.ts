import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMessages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsageAnalytics: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const synthesizeSpeech: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=chatController.d.ts.map