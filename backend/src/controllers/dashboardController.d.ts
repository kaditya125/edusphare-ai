import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getPerformanceHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRoadmap: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAnnouncements: (req: AuthRequest, res: Response) => Promise<void>;
export declare const search: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStudentSummaryAI: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPredictiveAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStudyBuddiesAI: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRecentFeedback: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFormalReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const emailReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getKnowledgeGraph: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=dashboardController.d.ts.map