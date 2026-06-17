"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = exports.authenticateToken = exports.authMiddleware = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (!req.user._id && req.user.id) {
            req.user._id = req.user.id;
        }
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
exports.authMiddleware = authMiddleware;
exports.authenticateToken = exports.authMiddleware;
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
            return;
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
//# sourceMappingURL=authMiddleware.js.map