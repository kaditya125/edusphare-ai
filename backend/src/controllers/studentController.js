"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAcademicOverview = exports.generateStudyPreferences = exports.optimizeProfile = exports.updateProfile = exports.getProfile = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Student_1 = __importDefault(require("../models/Student"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Result_1 = __importDefault(require("../models/Result"));
const Course_1 = __importDefault(require("../models/Course"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const embeddingService_1 = require("../ai/embeddingService");
const pineconeService_1 = require("../services/pineconeService");
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const getProfile = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id }).populate('userId', 'email profilePicture');
        if (!student) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch student profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        // Update allowed fields
        const { firstName, lastName, dob, contactNumber, address, program, currentSemester, advisor, enrollmentDate } = req.body;
        if (firstName)
            student.firstName = firstName;
        if (lastName)
            student.lastName = lastName;
        if (dob)
            student.dob = dob;
        if (contactNumber)
            student.contactNumber = contactNumber;
        if (address)
            student.address = address;
        if (program)
            student.program = program;
        if (currentSemester)
            student.currentSemester = currentSemester;
        if (advisor)
            student.advisor = advisor;
        if (enrollmentDate)
            student.enrollmentDate = enrollmentDate;
        if (req.body.bio !== undefined)
            student.bio = req.body.bio;
        if (req.body.skills)
            student.skills = req.body.skills;
        if (req.body.studyPreferences)
            student.studyPreferences = req.body.studyPreferences;
        await student.save();
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update student profile' });
    }
};
exports.updateProfile = updateProfile;
const optimizeProfile = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        // Fetch university skills/profile guidelines via Pinecone RAG
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)("student professional profile optimization, technical skills in demand, and university career guidelines");
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 3);
        const knowledgeContext = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        const currentBio = req.body.bio || student.bio || 'None';
        const systemPrompt = `You are an AI career advisor for a university student.
The student's name is ${student.firstName} ${student.lastName}.
They are in semester ${student.currentSemester} of ${student.department}.
Their current bio is: "${currentBio}"

University Context & Career Guidelines:
${knowledgeContext}

Please rewrite their bio to be highly professional and engaging (max 3 sentences). Also, suggest a list of 5-7 highly relevant technical and soft skills for their profile.
Return EXACTLY a JSON object in this format, with no markdown formatting:
{
  "bio": "Rewritten bio...",
  "skills": ["Skill 1", "Skill 2"]
}`;
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate the JSON profile optimization now.' }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 500,
        });
        let rawContent = completion.choices[0]?.message?.content || '{}';
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(rawContent);
        res.json(result);
    }
    catch (error) {
        console.error("Optimize Profile Error:", error);
        res.status(500).json({ error: 'Failed to optimize profile' });
    }
};
exports.optimizeProfile = optimizeProfile;
const generateStudyPreferences = async (req, res) => {
    try {
        const { goal } = req.body;
        // Fetch university study optimization rules via Pinecone RAG
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)("optimal study habits, university library hours, academic focus recommendations");
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 3);
        const knowledgeContext = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        const systemPrompt = `You are an AI study optimization assistant. 
The student's goal is: "${goal}"

University Context & Guidelines:
${knowledgeContext}

Based on this goal and guidelines, generate an optimal study configuration. Return EXACTLY a JSON object in this format, with no markdown formatting:
{
  "focusModeHours": <number between 1 and 8>,
  "preferredTime": "<Morning|Afternoon|Evening|Night>",
  "limitNotifications": <boolean>
}`;
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate the JSON study preferences now.' }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            max_tokens: 300,
        });
        let rawContent = completion.choices[0]?.message?.content || '{}';
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(rawContent);
        res.json(result);
    }
    catch (error) {
        console.error("Study Pref Error:", error);
        res.status(500).json({ error: 'Failed to generate study preferences' });
    }
};
exports.generateStudyPreferences = generateStudyPreferences;
const getAcademicOverview = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        const enrollments = await Enrollment_1.default.find({ studentId: student._id }).populate('courseId');
        // Calculate overall attendance
        const attendanceRecords = await Attendance_1.default.find({ studentId: student._id });
        const totalClasses = attendanceRecords.length;
        const classesAttended = attendanceRecords.filter(r => r.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 ? Math.round((classesAttended / totalClasses) * 100) : 0;
        res.json({
            cgpa: student.cgpa,
            sgpa: student.sgpa,
            creditsEarned: student.creditsEarned,
            creditsRemaining: student.creditsRemaining,
            attendancePercentage,
            totalCourses: enrollments.length
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch academic overview' });
    }
};
exports.getAcademicOverview = getAcademicOverview;
//# sourceMappingURL=studentController.js.map