"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const scheduleController_1 = require("../controllers/scheduleController");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.get('/', scheduleController_1.getStudentSchedule);
exports.default = router;
//# sourceMappingURL=scheduleRoutes.js.map