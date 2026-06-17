"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKnowledgeGraph = exports.emailReport = exports.getFormalReport = exports.getRecentFeedback = exports.getLeaderboard = exports.getStudyBuddiesAI = exports.getPredictiveAnalytics = exports.getStudentSummaryAI = exports.search = exports.getAnnouncements = exports.getRoadmap = exports.getPerformanceHistory = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Student_1 = __importDefault(require("../models/Student"));
const Course_1 = __importDefault(require("../models/Course"));
const Assignment_1 = __importDefault(require("../models/Assignment"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
const Submission_1 = __importDefault(require("../models/Submission"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Document_1 = require("../models/Document");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const embeddingService_1 = require("../ai/embeddingService");
const pineconeService_1 = require("../services/pineconeService");
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
// Helper to generate performance history based on actual student data
const getPerformanceHistory = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        // Since we don't have historical data in models, we'll generate a realistic
        // trend based on the student's current cgpa/sgpa. In a real scenario, this
        // would query past semester records.
        const baseScore = (student.cgpa / 10) * 100;
        const performanceData = [
            { name: "Quarter 1", score: Math.round(baseScore - 5), attendance: 92 },
            { name: "Quarter 2", score: Math.round(baseScore - 3), attendance: 85 },
            { name: "Half yearly", score: Math.round(baseScore - 1), attendance: 88 },
            { name: "Quarter 3", score: Math.round(baseScore - 4), attendance: 78 },
            { name: "Model", score: Math.round(baseScore + 2), attendance: 86 },
            { name: "Final exam", score: Math.round(baseScore + 5), attendance: 99 },
        ];
        res.json(performanceData);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch performance history' });
    }
};
exports.getPerformanceHistory = getPerformanceHistory;
const getRoadmap = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const roadmap = await Roadmap_1.default.find({ studentId: student._id }).sort({ order: 1 });
        res.json(roadmap);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch roadmap' });
    }
};
exports.getRoadmap = getRoadmap;
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement_1.default.find().sort({ createdAt: -1 }).limit(5);
        res.json(announcements);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};
exports.getAnnouncements = getAnnouncements;
const search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            res.json({ courses: [], faculty: [], assignments: [] });
            return;
        }
        const regex = new RegExp(q, 'i');
        const [courses, faculty, assignments] = await Promise.all([
            Course_1.default.find({ $or: [{ title: regex }, { courseCode: regex }] }).limit(5),
            Faculty_1.default.find({ $or: [{ firstName: regex }, { lastName: regex }, { department: regex }] }).limit(5),
            Assignment_1.default.find({ title: regex }).limit(5)
        ]);
        res.json({ courses, faculty, assignments });
    }
    catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
exports.search = search;
const getStudentSummaryAI = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const assignments = await Assignment_1.default.find({
            courseId: { $in: await Course_1.default.find({}).distinct('_id') },
            dueDate: { $gte: new Date() }
        });
        const pendingAssignments = assignments.length;
        // Fetch university academic advising guidelines via Pinecone RAG
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)("academic advising guidelines, student motivation, and student support services");
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 3);
        const knowledgeContext = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        const prompt = `Act as an encouraging, friendly academic advisor for a university student.
The student's name is ${student.firstName} ${student.lastName}.
They are in semester ${student.currentSemester} of ${student.department}.
Their current CGPA is ${student.cgpa}.
They have ${pendingAssignments} assignments due soon.

University Context & Policies:
${knowledgeContext}

Write a short, highly personalized 2-3 sentence motivational message giving them advice on how to proceed. Keep it very conversational, empathetic, and inspiring. Do not use robotic greetings.`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 150,
        });
        const advice = chatCompletion.choices[0]?.message?.content || "Keep up the great work! Stay focused on your goals.";
        const summary = {
            advice,
            student_info: {
                name: `${student.firstName} ${student.lastName}`,
                department: student.department,
                program: student.program,
                semester: student.currentSemester,
                cgpa: student.cgpa,
            },
            generatedAt: new Date().toISOString()
        };
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate AI summary' });
    }
};
exports.getStudentSummaryAI = getStudentSummaryAI;
const getPredictiveAnalytics = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const submissions = await Submission_1.default.find({ studentId: student._id }).sort({ submittedAt: -1 }).limit(5);
        const recentScores = submissions.map(s => s.marksObtained || 0);
        const avgRecent = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : student.cgpa * 10;
        const prompt = `You are a highly advanced predictive analytics AI for a university.
Analyze the following student data:
- Name: ${student.firstName} ${student.lastName}
- Current CGPA: ${student.cgpa}
- Recent Assignment Scores: ${recentScores.join(', ') || 'None yet'}
- Average Recent Performance: ${avgRecent.toFixed(1)}/100

Generate a predictive analytics report. Return ONLY a valid JSON object with no markdown formatting.
Format:
{
  "prediction": "String (e.g., 'On Track for Honors', 'At Risk in Recent Weeks', 'Steady Progress')",
  "trend": "String (either 'up', 'down', or 'neutral')",
  "insights": ["String array of 3 specific observations based on the data"],
  "actionableAdvice": "String (1 highly specific sentence of advice)"
}`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.2,
            response_format: { type: 'json_object' }
        });
        const content = chatCompletion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        res.json({
            ...parsed,
            metrics: {
                cgpa: student.cgpa,
                avgRecent: avgRecent.toFixed(1)
            }
        });
    }
    catch (error) {
        console.error('Predictive Analytics Error:', error);
        res.status(500).json({ error: 'Failed to generate predictive analytics' });
    }
};
exports.getPredictiveAnalytics = getPredictiveAnalytics;
const getStudyBuddiesAI = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        // Get courses this student is enrolled in
        const studentEnrollments = await Enrollment_1.default.find({ studentId: student._id });
        const enrolledCourseIds = studentEnrollments.map(e => e.courseId);
        // Find other students in the same courses
        const peersEnrollments = await Enrollment_1.default.find({
            courseId: { $in: enrolledCourseIds },
            studentId: { $ne: student._id }
        }).populate('studentId', 'firstName lastName profilePicture cgpa department');
        // Aggregate peers
        const peersMap = new Map();
        for (const e of peersEnrollments) {
            const peer = e.studentId;
            if (!peer)
                continue;
            if (!peersMap.has(peer._id.toString())) {
                peersMap.set(peer._id.toString(), {
                    _id: peer._id,
                    firstName: peer.firstName,
                    lastName: peer.lastName,
                    profilePicture: peer.profilePicture,
                    cgpa: peer.cgpa,
                    department: peer.department,
                    sharedCourses: 1
                });
            }
            else {
                peersMap.get(peer._id.toString()).sharedCourses += 1;
            }
        }
        const peersList = Array.from(peersMap.values()).slice(0, 10); // Take up to 10 peers
        if (peersList.length === 0) {
            res.json({ matches: [] });
            return;
        }
        const prompt = `You are an intelligent peer matchmaking AI for a university.
Match the student ${student.firstName} ${student.lastName} (CGPA: ${student.cgpa}) with the best study buddies from this list of peers who share classes with them:
${JSON.stringify(peersList, null, 2)}

Select exactly 3 peers who would make great study buddies (e.g. complementary CGPAs, same department).
Return ONLY a valid JSON object. NO markdown formatting.
Format:
{
  "matches": [
    {
      "peerId": "String (the _id of the peer)",
      "reason": "String (A short personalized sentence explaining why they are a good match, e.g. 'Jane excels in this course and can help you boost your grades.')"
    }
  ]
}`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });
        const aiContent = chatCompletion.choices[0]?.message?.content || '{"matches": []}';
        const parsed = JSON.parse(aiContent);
        // Merge AI reasons with peer data
        const finalMatches = parsed.matches.map((match) => {
            const peerData = peersList.find(p => p._id.toString() === match.peerId);
            return {
                ...peerData,
                matchReason: match.reason
            };
        }).filter((m) => m._id);
        res.json({ matches: finalMatches });
    }
    catch (error) {
        console.error('Study Buddies Error:', error);
        res.status(500).json({ error: 'Failed to find study buddies' });
    }
};
exports.getStudyBuddiesAI = getStudyBuddiesAI;
const getLeaderboard = async (req, res) => {
    try {
        const topStudents = await Student_1.default.find()
            .select('firstName lastName profilePicture cgpa department userId')
            .sort({ cgpa: -1 })
            .limit(5);
        const currentUser = await Student_1.default.findOne({ userId: req.user?.id });
        let currentUserRank = null;
        let currentUserData = null;
        if (currentUser) {
            currentUserRank = await Student_1.default.countDocuments({ cgpa: { $gt: currentUser.cgpa } }) + 1;
            currentUserData = {
                _id: currentUser._id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                profilePicture: currentUser.profilePicture,
                cgpa: currentUser.cgpa,
                department: currentUser.department,
                userId: currentUser.userId
            };
        }
        res.json({ topStudents, currentUserRank, currentUser: currentUserData });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
exports.getLeaderboard = getLeaderboard;
const getRecentFeedback = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const submissions = await Submission_1.default.find({ studentId: student._id })
            .populate({
            path: 'assignmentId',
            populate: { path: 'courseId', select: 'title courseCode facultyId', populate: { path: 'facultyId', select: 'firstName lastName profilePicture' } }
        })
            .sort({ submittedAt: -1 })
            .limit(3);
        const feedback = submissions.map(sub => ({
            _id: sub._id,
            feedback: sub.feedback || 'Great work! Keep it up.',
            score: sub.marksObtained,
            assignment: sub.assignmentId?.title,
            course: sub.assignmentId?.courseId?.courseCode,
            faculty: sub.assignmentId?.courseId?.facultyId,
            date: sub.submittedAt
        }));
        res.json(feedback);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent feedback' });
    }
};
exports.getRecentFeedback = getRecentFeedback;
const getFormalReport = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const enrollments = await Enrollment_1.default.find({ studentId: student._id });
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const courses = await Course_1.default.find({ _id: { $in: enrolledCourseIds } }).populate('facultyId');
        // In a real app we'd fetch actual student grades per course.
        // Here we'll generate realistic mock grades based on CGPA for the report card.
        const grades = courses.slice(0, 5).map(c => {
            const isExcellent = student.cgpa > 8.5;
            const gradeLetter = isExcellent ? (Math.random() > 0.5 ? 'A+' : 'A') : (Math.random() > 0.5 ? 'B+' : 'B');
            let professorName = 'Dr. Faculty';
            if (c.facultyId && typeof c.facultyId === 'object' && 'firstName' in c.facultyId) {
                professorName = `Prof. ${c.facultyId.lastName}`;
            }
            return {
                courseCode: c.courseCode,
                courseName: c.title,
                credits: c.credits || 4,
                grade: gradeLetter,
                professorName
            };
        });
        // Fetch formal transcript evaluation guidelines via Pinecone RAG
        const transcriptQuery = await (0, embeddingService_1.generateEmbedding)("official academic evaluation guidelines, university transcript policies, and formal dean statements");
        const transcriptMatches = await (0, pineconeService_1.queryKnowledge)(transcriptQuery, 3);
        const transcriptContext = transcriptMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        const prompt = `Act as the Dean of the University.
The student's name is ${student.firstName} ${student.lastName} (Enrollment No: ${student.enrollmentNumber || 'EN123456'}).
They are in semester ${student.currentSemester} of ${student.department}.
Their current CGPA is ${student.cgpa}.

University Context & Evaluation Policies:
${transcriptContext}

Write a formal, official academic evaluation (2 paragraphs) summarizing their performance. 
Mention their dedication, academic standing, and potential. 
Use a highly professional, academic tone suitable for an official university transcript. Do not use conversational language. Start directly with the evaluation.`;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            max_tokens: 300,
        });
        const evaluation = chatCompletion.choices[0]?.message?.content || "The student has demonstrated satisfactory academic performance.";
        res.json({
            studentInfo: {
                name: `${student.firstName} ${student.lastName}`,
                enrollmentNumber: student.enrollmentNumber || 'EN123456',
                department: student.department,
                program: student.program,
                semester: student.currentSemester,
                cgpa: student.cgpa,
            },
            grades,
            evaluation,
            date: new Date().toLocaleDateString()
        });
    }
    catch (error) {
        console.error('Formal Report Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate formal report', stack: error.stack });
    }
};
exports.getFormalReport = getFormalReport;
const emailReport = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Email address is required' });
            return;
        }
        // Simulate sending email (in a real app, use Nodemailer, SendGrid, etc.)
        console.log(`[Email Simulation] Sending Official Report PDF to ${email}`);
        // Fake delay to simulate email network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        res.json({ success: true, message: `Official Report successfully sent to ${email}` });
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
};
exports.emailReport = emailReport;
const getKnowledgeGraph = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const nodes = [];
        const links = [];
        // Central Node
        nodes.push({ id: 'user', name: `${student.firstName} ${student.lastName}`, group: 'user', val: 20 });
        // Courses & Faculty
        const enrollments = await Enrollment_1.default.find({ studentId: student._id }).populate({
            path: 'courseId',
            populate: { path: 'facultyId' }
        });
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        for (const enrollment of enrollments) {
            const course = enrollment.courseId;
            if (!course)
                continue;
            const courseNodeId = `course_${course._id}`;
            nodes.push({ id: courseNodeId, name: course.title, group: 'course', val: 12 });
            links.push({ source: 'user', target: courseNodeId });
            if (course.facultyId) {
                const facId = `fac_${course.facultyId._id}`;
                if (!nodes.find(n => n.id === facId)) {
                    nodes.push({ id: facId, name: `${course.facultyId.firstName} ${course.facultyId.lastName}`, group: 'faculty', val: 8 });
                }
                links.push({ source: courseNodeId, target: facId });
            }
        }
        // Assignments
        const assignments = await Assignment_1.default.find({ courseId: { $in: enrolledCourseIds } });
        for (const assignment of assignments) {
            const assId = `ass_${assignment._id}`;
            nodes.push({ id: assId, name: assignment.title, group: 'assignment', val: 6 });
            links.push({ source: `course_${assignment.courseId}`, target: assId });
        }
        // Knowledge Hub Documents
        const documents = await Document_1.Document.find({ status: 'ready' }).limit(10);
        if (documents.length > 0) {
            const hubNodeId = 'hub_root';
            nodes.push({ id: hubNodeId, name: 'Knowledge Hub', group: 'hub', val: 15 });
            links.push({ source: 'user', target: hubNodeId });
            for (const doc of documents) {
                const docId = `doc_${doc._id}`;
                nodes.push({ id: docId, name: doc.originalName, group: 'document', val: 5 });
                links.push({ source: hubNodeId, target: docId });
            }
        }
        res.json({ nodes, links });
    }
    catch (error) {
        console.error('Graph Error:', error);
        res.status(500).json({ error: 'Failed to fetch graph data' });
    }
};
exports.getKnowledgeGraph = getKnowledgeGraph;
//# sourceMappingURL=dashboardController.js.map