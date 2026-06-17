"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentSchedule = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Student_1 = __importDefault(require("../models/Student"));
const Course_1 = __importDefault(require("../models/Course"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const getStudentSchedule = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const enrollments = await Enrollment_1.default.find({ studentId: student._id }).select('courseId');
        const courseIds = enrollments.map(e => e.courseId);
        const schedule = await Schedule_1.default.find({ courseId: { $in: courseIds } })
            .populate({
            path: 'courseId',
            populate: { path: 'facultyId', select: 'firstName lastName' }
        })
            .sort({ startTime: 1 });
        res.json(schedule);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
};
exports.getStudentSchedule = getStudentSchedule;
//# sourceMappingURL=scheduleController.js.map