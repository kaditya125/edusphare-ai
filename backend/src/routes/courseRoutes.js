"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.use((0, authMiddleware_1.roleMiddleware)(['student']));
router.get('/courses', courseController_1.getEnrolledCourses);
router.get('/assignments', courseController_1.getAssignments);
router.post('/assignments/:id/ai-grade', courseController_1.aiGradeAssignment);
router.post('/:id/generate-quiz', courseController_1.generateQuizAI);
router.get('/exams/results', courseController_1.getExamsAndResults);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map