import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const optimizeProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateStudyPreferences: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAcademicOverview: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=studentController.d.ts.map