import express from 'express';
import { getProfile, updateProfile, optimizeProfile, generateStudyPreferences, getAcademicOverview } from '../controllers/studentController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['student']));

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/me/ai/optimize-profile', optimizeProfile);
router.post('/me/ai/study-preferences', generateStudyPreferences);
router.get('/me/overview', getAcademicOverview);

export default router;
