"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.login = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        let profile = null;
        if (user.role === 'student') {
            const Student = require('../models/Student').default;
            profile = await Student.findOne({ userId: user._id });
        }
        else if (user.role === 'faculty') {
            const Faculty = require('../models/Faculty').default;
            profile = await Faculty.findOne({ userId: user._id });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                profile,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.default.findById(req.user.id).select('-passwordHash');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        let profile = null;
        if (user.role === 'student') {
            const Student = require('../models/Student').default;
            profile = await Student.findOne({ userId: user._id });
        }
        else if (user.role === 'faculty') {
            const Faculty = require('../models/Faculty').default;
            profile = await Faculty.findOne({ userId: user._id });
        }
        res.json({
            id: user._id,
            email: user.email,
            role: user.role,
            profile
        });
    }
    catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMe = getMe;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }
        user.passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('ChangePassword Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map