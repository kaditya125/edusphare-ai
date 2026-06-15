import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todoController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
