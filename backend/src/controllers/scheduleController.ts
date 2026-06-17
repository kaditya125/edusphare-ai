import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Schedule from '../models/Schedule';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Course from '../models/Course';
import Faculty from '../models/Faculty';

export const getStudentSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id || '' });
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

    let augmentedSchedule: any[] = schedule.map(s => s.toObject());

    // --- SMART SCHEDULING LOGIC ---
    // Fetch upcoming pending assignments
    const Assignment = require('../models/Assignment').default;
    const Submission = require('../models/Submission').default;
    
    const assignments = await Assignment.find({ 
      courseId: { $in: courseIds },
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    }).populate('courseId', 'title');

    const submissions = await Submission.find({ studentId: student._id });
    
    const pendingAssignments = assignments.filter((a: any) => 
      !submissions.some((s: any) => s.assignmentId.toString() === a._id.toString())
    );

    if (pendingAssignments.length > 0) {
      // Inject a recommended study block for the most urgent assignment
      const mostUrgent = pendingAssignments.sort((a: any, b: any) => a.dueDate.getTime() - b.dueDate.getTime())[0];
      const urgentCourse = mostUrgent.courseId as any;

      // Mock free time injection (e.g. Wednesday 4PM)
      augmentedSchedule.push({
        _id: 'smart-block-' + mostUrgent._id,
        courseId: { title: `Study: ${urgentCourse.title}` },
        dayOfWeek: 'Wednesday',
        startTime: '16:00',
        endTime: '18:00',
        location: 'AI Recommended',
        type: 'Lecture', // To fit into frontend model
        isSmartBlock: true
      });
    }

    res.json(augmentedSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};
