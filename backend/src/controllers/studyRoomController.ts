import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import StudyRoom from '../models/StudyRoom';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

export const getStudyRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id || '' });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Get active study rooms, ideally for courses the student is enrolled in
    const enrollments = await Enrollment.find({ studentId: student._id }).select('courseId');
    const courseIds = enrollments.map(e => e.courseId);

    const filter: any = { 
      isActive: true,
      $or: [
        { courseId: { $in: courseIds } },
        { courseId: { $exists: false } },
        { courseId: null }
      ]
    };
    const rooms = await StudyRoom.find(filter).populate('hostId', 'firstName lastName profilePicture').sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study rooms' });
  }
};

export const createStudyRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id || '' });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const { name, courseId, theme } = req.body;
    
    const newRoom = new StudyRoom({
      name: name || 'General Study Room',
      hostId: student._id,
      courseId: courseId || undefined,
      participants: [student._id],
      theme: theme || 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'
    });

    await newRoom.save();
    
    // Return populated room
    const populatedRoom = await (StudyRoom as any).findById(newRoom._id).populate('hostId', 'firstName lastName profilePicture');
    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create study room' });
  }
};

export const joinStudyRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?.id || '' });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const room = await (StudyRoom as any).findById(req.params.id);
    if (!room) {
      res.status(404).json({ error: 'Study room not found' });
      return;
    }

    if (!room.participants.includes(student._id)) {
      room.participants.push(student._id);
      await room.save();
    }

    res.json({ message: 'Joined successfully', room });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join study room' });
  }
};
