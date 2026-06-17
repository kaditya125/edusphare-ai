"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calendarController_1 = require("../controllers/calendarController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.get('/events', calendarController_1.getEvents);
router.post('/ai-optimize', calendarController_1.optimizeSchedule);
router.get('/export', calendarController_1.exportICS);
exports.default = router;
//# sourceMappingURL=calendarRoutes.js.map