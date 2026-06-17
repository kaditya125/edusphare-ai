"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All chat routes require authentication
router.use(authMiddleware_1.authenticateToken);
router.get('/analytics', chatController_1.getUsageAnalytics);
router.get('/history', chatController_1.getHistory);
router.get('/:chatId/messages', chatController_1.getMessages);
router.post('/message', chatController_1.sendMessage);
router.post('/synthesize', chatController_1.synthesizeSpeech);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map