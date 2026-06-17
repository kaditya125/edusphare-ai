"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.get('/performance-history', dashboardController_1.getPerformanceHistory);
router.get('/announcements', dashboardController_1.getAnnouncements);
router.get('/roadmap', dashboardController_1.getRoadmap);
router.get('/leaderboard', dashboardController_1.getLeaderboard);
router.get('/feedback', dashboardController_1.getRecentFeedback);
router.get('/search', dashboardController_1.search);
router.get('/ai-summary', dashboardController_1.getStudentSummaryAI);
router.get('/formal-report', dashboardController_1.getFormalReport);
router.post('/email-report', dashboardController_1.emailReport);
router.get('/graph', dashboardController_1.getKnowledgeGraph);
router.get('/predictive-analytics', dashboardController_1.getPredictiveAnalytics);
router.get('/study-buddies', dashboardController_1.getStudyBuddiesAI);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map