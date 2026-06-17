"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodos = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Student_1 = __importDefault(require("../models/Student"));
const Todo_1 = __importDefault(require("../models/Todo"));
const getTodos = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const todos = await Todo_1.default.find({ studentId: student._id }).sort({ createdAt: -1 });
        res.json(todos);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};
exports.getTodos = getTodos;
const createTodo = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const { text, priority, dueDate } = req.body;
        if (!text) {
            res.status(400).json({ error: 'Text is required' });
            return;
        }
        const todo = new Todo_1.default({
            studentId: student._id,
            text,
            priority: priority || 'medium',
            dueDate: dueDate || undefined,
            isCompleted: false
        });
        await todo.save();
        res.status(201).json(todo);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create todo' });
    }
};
exports.createTodo = createTodo;
const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted, text, priority, dueDate } = req.body;
        const todo = await Todo_1.default.findByIdAndUpdate(id, {
            ...(isCompleted !== undefined && { isCompleted }),
            ...(text && { text }),
            ...(priority && { priority }),
            ...(dueDate !== undefined && { dueDate })
        }, { new: true });
        if (!todo) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        res.json(todo);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update todo' });
    }
};
exports.updateTodo = updateTodo;
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo_1.default.findByIdAndDelete(id);
        if (!todo) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        res.json({ message: 'Todo deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};
exports.deleteTodo = deleteTodo;
//# sourceMappingURL=todoController.js.map