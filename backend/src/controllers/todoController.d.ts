import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getTodos: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createTodo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTodo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTodo: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=todoController.d.ts.map