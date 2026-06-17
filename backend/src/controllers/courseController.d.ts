import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getEnrolledCourses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAssignments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getExamsAndResults: (req: AuthRequest, res: Response) => Promise<void>;
export declare const aiGradeAssignment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateQuizAI: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=courseController.d.ts.map