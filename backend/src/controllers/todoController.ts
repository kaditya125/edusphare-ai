import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Student from '../models/Student';
import Todo from '../models/Todo';

export const getTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const todos = await Todo.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

export const createTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const { text, priority, dueDate } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const todo = new Todo({
      studentId: student._id,
      text,
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      isCompleted: false
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isCompleted, text, priority, dueDate } = req.body;

    const todo = await Todo.findByIdAndUpdate(
      id,
      { 
        ...(isCompleted !== undefined && { isCompleted }), 
        ...(text && { text }), 
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate })
      },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
