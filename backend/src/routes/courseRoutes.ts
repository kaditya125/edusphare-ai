import express from 'express';
import { getEnrolledCourses, getAssignments, getExamsAndResults } from '../controllers/courseController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['student']));

router.get('/courses', getEnrolledCourses);
router.get('/assignments', getAssignments);
router.get('/exams/results', getExamsAndResults);

export default router;
