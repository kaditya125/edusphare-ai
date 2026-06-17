"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportICS = exports.optimizeSchedule = exports.getEvents = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Student_1 = __importDefault(require("../models/Student"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Course_1 = __importDefault(require("../models/Course"));
const Todo_1 = __importDefault(require("../models/Todo"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const embeddingService_1 = require("../ai/embeddingService");
const pineconeService_1 = require("../services/pineconeService");
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
// Get all events for the calendar (classes + todos) within a date range
const getEvents = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            console.log("Student not found for userId:", req.user?.id);
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        console.log(`Events requested by ${student.firstName} from ${req.query.start} to ${req.query.end}`);
        const startQuery = req.query.start;
        const endQuery = req.query.end;
        if (!startQuery || !endQuery) {
            res.status(400).json({ error: 'start and end query parameters are required' });
            return;
        }
        const startDate = new Date(startQuery);
        const endDate = new Date(endQuery);
        // 1. Fetch Enrolled Courses
        const enrollments = await Enrollment_1.default.find({ studentId: student._id }).populate('courseId');
        const courseIds = enrollments.map(e => e.courseId._id);
        // 2. Fetch recurring Schedules for these courses
        const schedules = await Schedule_1.default.find({ courseId: { $in: courseIds } }).populate({
            path: 'courseId',
            populate: { path: 'facultyId' }
        });
        const events = [];
        // Generate instances of schedules within the date range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday...
            const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);
            for (const s of daySchedules) {
                const course = s.courseId;
                const faculty = course.facultyId;
                // Convert startTime "10:30" to numeric hours 10.5
                const [startH, startM] = s.startTime.split(':').map(Number);
                const [endH, endM] = s.endTime.split(':').map(Number);
                const startHours = startH + (startM / 60);
                const endHours = endH + (endM / 60);
                events.push({
                    id: `class-${s._id}-${d.getTime()}`,
                    title: course.title,
                    type: 'Class',
                    category: 'Lectures',
                    date: new Date(d),
                    startTime: startHours,
                    duration: endHours - startHours,
                    location: s.room,
                    credits: course.credits,
                    instructor: {
                        name: faculty ? `${faculty.firstName} ${faculty.lastName}` : 'TBA',
                        role: 'Professor',
                        avatar: faculty?.profilePicture || 'https://api.dicebear.com/7.x/notionists/svg?seed=prof'
                    },
                    participants: [],
                    courseCode: course.courseCode
                });
            }
        }
        // 3. Fetch Todos with due dates
        const todos = await Todo_1.default.find({
            studentId: student._id,
            dueDate: { $gte: startDate, $lte: endDate },
            isCompleted: false
        });
        for (const t of todos) {
            if (!t.dueDate)
                continue;
            events.push({
                id: `todo-${t._id}`,
                title: `Deadline: ${t.text}`,
                type: 'Deadline',
                category: 'Exams', // Render deadines similarly to exams
                date: new Date(t.dueDate),
                startTime: 9, // Default to 9 AM
                duration: 1,
                location: 'Online',
                credits: 0,
                instructor: { name: 'Self', role: 'Student', avatar: '' },
                participants: []
            });
        }
        res.json(events);
    }
    catch (error) {
        console.error("Calendar getEvents Error:", error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
};
exports.getEvents = getEvents;
const optimizeSchedule = async (req, res) => {
    try {
        const student = await Student_1.default.findOne({ userId: req.user?.id });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const { events, startDate } = req.body; // Expects the current week's events
        // Convert to simplified format to save tokens
        const simpleEvents = events.map((e) => ({
            title: e.title,
            day: new Date(e.date).getDay(), // 0-6
            start: e.startTime,
            duration: e.duration
        }));
        // Fetch University Scheduling Guidelines via Pinecone RAG
        const queryEmbedding = await (0, embeddingService_1.generateEmbedding)("university library hours, study room guidelines, and course schedule optimization");
        const pineconeMatches = await (0, pineconeService_1.queryKnowledge)(queryEmbedding, 3);
        const knowledgeContext = pineconeMatches
            .map(match => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
            .join('\n\n');
        const systemPrompt = `You are an AI schedule optimizer. 
The student has the following classes this week:
${JSON.stringify(simpleEvents)}

University Context & Guidelines:
${knowledgeContext}

Find 3 empty gaps in this schedule (between 9 AM and 6 PM) and suggest them as "Study Blocks" for specific courses.
Return EXACTLY a valid JSON object with a single key "studyBlocks" containing an array of objects.
Format:
{
  "studyBlocks": [
    {
      "title": "Study: [Course Name]",
      "day": <0-6 representing day of week>,
      "startTime": <number, e.g. 14.5 for 2:30 PM>,
      "duration": 2
    }
  ]
}`;
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate the study blocks now.' }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });
        const rawContent = completion.choices[0]?.message?.content || '{"studyBlocks": []}';
        const result = JSON.parse(rawContent).studyBlocks || [];
        // Map back to full event objects for the frontend
        const weekStart = new Date(startDate);
        const optimizedEvents = result.map((r, idx) => {
            const d = new Date(weekStart);
            // Adjust to the specific day of the week
            const diff = r.day - d.getDay();
            d.setDate(d.getDate() + diff);
            return {
                id: `ai-block-${idx}`,
                title: r.title,
                type: 'Study',
                category: 'Workshops', // Map to a color
                date: d,
                startTime: r.startTime,
                duration: r.duration,
                location: 'Library',
                credits: 0,
                instructor: { name: 'AI Optimizer', role: 'System', avatar: '' },
                participants: [],
                isAI: true
            };
        });
        res.json(optimizedEvents);
    }
    catch (error) {
        console.error("AI Optimizer Error:", error);
        res.status(500).json({ error: 'Failed to optimize schedule', details: error.message, stack: error.stack });
    }
};
exports.optimizeSchedule = optimizeSchedule;
const exportICS = async (req, res) => {
    try {
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EduSphere AI//Calendar//EN
BEGIN:VEVENT
UID:sample-event-1@edusphere.ai
DTSTAMP:20260615T120000Z
DTSTART:20260616T090000Z
DTEND:20260616T103000Z
SUMMARY:Exported Class Schedule
END:VEVENT
END:VCALENDAR`;
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename="schedule.ics"');
        res.send(icsContent);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export ICS' });
    }
};
exports.exportICS = exportICS;
//# sourceMappingURL=calendarController.js.map