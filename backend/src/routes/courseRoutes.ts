import express from 'express';
import { getEnrolledCourses, getAssignments, getExamsAndResults, aiGradeAssignment, generateQuizAI } from '../controllers/courseController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['student']));

router.get('/courses', getEnrolledCourses);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/ai-grade', aiGradeAssignment);
router.post('/:id/generate-quiz', generateQuizAI);
router.get('/exams/results', getExamsAndResults);

export default router;
