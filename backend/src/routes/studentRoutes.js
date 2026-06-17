"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controllers/studentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.use((0, authMiddleware_1.roleMiddleware)(['student']));
router.get('/me', studentController_1.getProfile);
router.put('/me', studentController_1.updateProfile);
router.post('/me/ai/optimize-profile', studentController_1.optimizeProfile);
router.post('/me/ai/study-preferences', studentController_1.generateStudyPreferences);
router.get('/me/overview', studentController_1.getAcademicOverview);
exports.default = router;
//# sourceMappingURL=studentRoutes.js.map