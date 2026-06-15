import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Student from '../models/Student';
import Course from '../models/Course';
import Assignment from '../models/Assignment';
import Faculty from '../models/Faculty';
import Announcement from '../models/Announcement';
import Roadmap from '../models/Roadmap';
import Submission from '../models/Submission';
import Enrollment from '../models/Enrollment';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to generate performance history based on actual student data
export const getPerformanceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance history' });
  }
};

export const getRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const roadmap = await Roadmap.find({ studentId: student._id }).sort({ order: 1 });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const search = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.json({ courses: [], faculty: [], assignments: [] });
      return;
    }

    const regex = new RegExp(q, 'i');

    const [courses, faculty, assignments] = await Promise.all([
      Course.find({ $or: [{ title: regex }, { courseCode: regex }] }).limit(5),
      Faculty.find({ $or: [{ firstName: regex }, { lastName: regex }, { department: regex }] }).limit(5),
      Assignment.find({ title: regex }).limit(5)
    ]);

    res.json({ courses, faculty, assignments });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

export const getStudentSummaryAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    
    const assignments = await Assignment.find({ 
      courseId: { $in: await Course.find({}).distinct('_id') },
      dueDate: { $gte: new Date() }
    });

    const pendingAssignments = assignments.length;

    const prompt = `Act as an encouraging, friendly academic advisor for a university student.
The student's name is ${student.firstName} ${student.lastName}.
They are in semester ${student.currentSemester} of ${student.department}.
Their current CGPA is ${student.cgpa}.
They have ${pendingAssignments} assignments due soon.

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
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topStudents = await Student.find()
      .select('firstName lastName profilePicture cgpa department userId')
      .sort({ cgpa: -1 })
      .limit(5);

    const currentUser = await Student.findOne({ userId: req.user?.id });
    let currentUserRank = null;
    let currentUserData = null;

    if (currentUser) {
       currentUserRank = await Student.countDocuments({ cgpa: { $gt: currentUser.cgpa } }) + 1;
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const getRecentFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const submissions = await Submission.find({ studentId: student._id })
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
      assignment: (sub.assignmentId as any)?.title,
      course: (sub.assignmentId as any)?.courseId?.courseCode,
      faculty: (sub.assignmentId as any)?.courseId?.facultyId,
      date: sub.submittedAt
    }));

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent feedback' });
  }
};

export const getFormalReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: student._id });
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } }).populate('facultyId');

    // In a real app we'd fetch actual student grades per course.
    // Here we'll generate realistic mock grades based on CGPA for the report card.
    const grades = courses.slice(0, 5).map(c => {
      const isExcellent = student.cgpa > 8.5;
      const gradeLetter = isExcellent ? (Math.random() > 0.5 ? 'A+' : 'A') : (Math.random() > 0.5 ? 'B+' : 'B');
      
      let professorName = 'Dr. Faculty';
      if (c.facultyId && typeof c.facultyId === 'object' && 'firstName' in c.facultyId) {
        professorName = `Prof. ${(c.facultyId as any).lastName}`;
      }

      return {
        courseCode: c.courseCode,
        courseName: c.title,
        credits: c.credits || 4,
        grade: gradeLetter,
        professorName
      };
    });

    const prompt = `Act as the Dean of Jamia Hamdard University.
The student's name is ${student.firstName} ${student.lastName} (Enrollment No: ${student.enrollmentNumber || 'EN123456'}).
They are in semester ${student.currentSemester} of ${student.department}.
Their current CGPA is ${student.cgpa}.

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
  } catch (error: any) {
    console.error('Formal Report Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate formal report', stack: error.stack });
  }
};

export const emailReport = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
