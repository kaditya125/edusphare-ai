"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizAI = exports.aiGradeAssignment = exports.getExamsAndResults = exports.getAssignments = exports.getEnrolledCourses = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Student_1 = __importDefault(require("../models/Student"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Assignment_1 = __importDefault(require("../models/Assignment"));
const Submission_1 = __importDefault(require("../models/Submission"));
const Exam_1 = __importDefault(require("../models/Exam"));
const Result_1 = __importDefault(require("../models/Result"));
const Course_1 = __importDefault(require("../models/Course"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const getEnrolledCourses = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const enrollments = await Enrollment_1.default.find({ studentId: student._id })
            .populate({
            path: 'courseId',
            populate: { path: 'facultyId', select: 'firstName lastName department designation profilePicture' }
        });
        console.log("ENROLLMENTS:", JSON.stringify(enrollments, null, 2));
        res.json(enrollments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
const getAssignments = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student)
            return;
        const enrollments = await Enrollment_1.default.find({ studentId: student._id }).select('courseId');
        const courseIds = enrollments.map(e => e.courseId);
        const assignments = await Assignment_1.default.find({ courseId: { $in: courseIds } }).populate('courseId', 'title courseCode');
        const submissions = await Submission_1.default.find({ studentId: student._id });
        // Combine assignments with user submission status
        const result = assignments.map(assignment => {
            const submission = submissions.find(s => s.assignmentId.toString() === assignment._id.toString());
            return {
                ...assignment.toObject(),
                submissionStatus: submission ? 'Submitted' : 'Pending',
                submission: submission || null
            };
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};
exports.getAssignments = getAssignments;
const getExamsAndResults = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student)
            return;
        const results = await Result_1.default.find({ studentId: student._id }).populate({
            path: 'examId',
            populate: { path: 'courseId', select: 'title courseCode' }
        });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch exam results' });
    }
};
exports.getExamsAndResults = getExamsAndResults;
const aiGradeAssignment = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const { id } = req.params; // assignmentId
        const { content } = req.body; // submission content
        const assignment = await Assignment_1.default.findById(id).populate('courseId');
        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }
        const prompt = `You are a strict but fair AI University Professor.
Please evaluate the following student assignment submission.

Assignment Details:
- Title: ${assignment.title}
- Description: ${assignment.description}
- Max Marks: ${assignment.maxMarks}

Student Submission:
"""
${content}
"""

Evaluate the submission. Return ONLY a valid JSON object with NO markdown formatting.
Format:
{
  "score": number (out of ${assignment.maxMarks}),
  "feedback": "String (a short paragraph of constructive feedback)"
}`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });
        const aiContent = chatCompletion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(aiContent);
        // Save or update submission
        let submission = await Submission_1.default.findOne({ assignmentId: assignment._id, studentId: student._id });
        if (submission) {
            submission.content = content;
            submission.marksObtained = parsed.score;
            submission.feedback = parsed.feedback;
            submission.submittedAt = new Date();
            await submission.save();
        }
        else {
            submission = new Submission_1.default({
                assignmentId: assignment._id,
                studentId: student._id,
                content: content,
                marksObtained: parsed.score,
                feedback: parsed.feedback,
                submittedAt: new Date()
            });
            await submission.save();
        }
        res.json(submission);
    }
    catch (error) {
        console.error('AI Grading Error:', error);
        res.status(500).json({ error: 'Failed to auto-grade assignment' });
    }
};
exports.aiGradeAssignment = aiGradeAssignment;
const generateQuizAI = async (req, res) => {
    try {
        const { id } = req.params; // courseId
        const course = await Course_1.default.findById(id);
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const prompt = `You are an expert AI professor. Generate a 5-question multiple-choice quiz for a university course titled "${course.title}" (Code: ${course.courseCode}, Credits: ${course.credits}). 
The quiz should test core concepts related to this subject at a university level.

Return ONLY a valid JSON object containing an array of questions. NO markdown formatting.
Format:
{
  "questions": [
    {
      "question": "String",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0, // index of the correct option
      "explanation": "String (Why is this the correct answer?)"
    }
  ]
}`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });
        const aiContent = chatCompletion.choices[0]?.message?.content || '{"questions": []}';
        const parsed = JSON.parse(aiContent);
        res.json(parsed);
    }
    catch (error) {
        console.error('Quiz Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
};
exports.generateQuizAI = generateQuizAI;
//# sourceMappingURL=courseController.js.map