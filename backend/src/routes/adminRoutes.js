"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
// In a real app we'd add adminAuthMiddleware here
const router = express_1.default.Router();
router.get('/knowledge-sync', adminController_1.getKnowledgeSyncStats);
router.post('/knowledge-sync/trigger', adminController_1.triggerKnowledgeSync);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map