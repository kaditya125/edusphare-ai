"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/login', authController_1.login);
router.get('/me', authMiddleware_1.authenticateToken, authController_1.getMe);
router.post('/change-password', authMiddleware_1.authenticateToken, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map