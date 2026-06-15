import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import Attendance from '../models/Attendance';
import Result from '../models/Result';
import Course from '../models/Course';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id }).populate('userId', 'email profilePicture');
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    
    // Update allowed fields
    const { firstName, lastName, dob, contactNumber, address, program, currentSemester, advisor, enrollmentDate } = req.body;
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (dob) student.dob = dob;
    if (contactNumber) student.contactNumber = contactNumber;
    if (address) student.address = address;
    if (program) student.program = program;
    if (currentSemester) student.currentSemester = currentSemester;
    if (advisor) student.advisor = advisor;
    if (enrollmentDate) student.enrollmentDate = enrollmentDate;
    if (req.body.bio !== undefined) student.bio = req.body.bio;
    if (req.body.skills) student.skills = req.body.skills;
    if (req.body.studyPreferences) student.studyPreferences = req.body.studyPreferences;

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student profile' });
  }
};

export const optimizeProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const systemPrompt = `You are an expert academic and career advisor.
The student's name is ${student.firstName} ${student.lastName}. They are studying ${student.program} in the ${student.department} department.
Current Bio: ${req.body.bio || 'None'}
Current Skills: ${(req.body.skills || []).join(', ') || 'None'}

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
  } catch (error: any) {
    console.error("Optimize Profile Error:", error);
    res.status(500).json({ error: 'Failed to optimize profile' });
  }
};

export const generateStudyPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goal } = req.body;
    
    const systemPrompt = `You are an AI study optimization assistant. 
The student's goal is: "${goal}"

Based on this goal, generate an optimal study configuration. Return EXACTLY a JSON object in this format, with no markdown formatting:
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
  } catch (error: any) {
    console.error("Study Pref Error:", error);
    res.status(500).json({ error: 'Failed to generate study preferences' });
  }
};

export const getAcademicOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: student._id }).populate('courseId');
    
    // Calculate overall attendance
    const attendanceRecords = await Attendance.find({ studentId: student._id });
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academic overview' });
  }
};
