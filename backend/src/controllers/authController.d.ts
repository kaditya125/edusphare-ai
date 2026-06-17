import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: AuthRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map