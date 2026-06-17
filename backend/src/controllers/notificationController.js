"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Notification_1 = __importDefault(require("../models/Notification"));
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification_1.default.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification_1.default.findOneAndUpdate({ _id: id, userId: req.user?.id }, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        await Notification_1.default.updateMany({ userId: req.user?.id, isRead: false }, { isRead: true });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notificationController.js.map