import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import Attendance from '../models/Attendance';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Exam from '../models/Exam';
import Result from '../models/Result';
import Course from '../models/Course';
import Faculty from '../models/Faculty';

export const getEnrolledCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: student._id })
      .populate({
        path: 'courseId',
        populate: { path: 'facultyId', select: 'firstName lastName department designation profilePicture' }
      });
      
    console.log("ENROLLMENTS:", JSON.stringify(enrollments, null, 2));
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) return;

    const enrollments = await Enrollment.find({ studentId: student._id }).select('courseId');
    const courseIds = enrollments.map(e => e.courseId);

    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).populate('courseId', 'title courseCode');
    const submissions = await Submission.find({ studentId: student._id });

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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const getExamsAndResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) return;

    const results = await Result.find({ studentId: student._id }).populate({
      path: 'examId',
      populate: { path: 'courseId', select: 'title courseCode' }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam results' });
  }
};
