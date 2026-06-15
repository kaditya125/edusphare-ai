import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Schedule from '../models/Schedule';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Course from '../models/Course';
import Faculty from '../models/Faculty';

export const getStudentSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: student._id }).select('courseId');
    const courseIds = enrollments.map(e => e.courseId);

    const schedule = await Schedule.find({ courseId: { $in: courseIds } })
      .populate({
        path: 'courseId',
        populate: { path: 'facultyId', select: 'firstName lastName' }
      })
      .sort({ startTime: 1 });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};
