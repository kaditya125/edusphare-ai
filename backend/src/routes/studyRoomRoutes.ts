import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getStudyRooms, createStudyRoom, joinStudyRoom } from '../controllers/studyRoomController';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getStudyRooms);
router.post('/', createStudyRoom);
router.post('/:id/join', joinStudyRoom);

export default router;
