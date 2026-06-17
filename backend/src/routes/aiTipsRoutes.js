"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groqService_1 = require("../services/groqService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const view = req.query.view || 'dashboard';
        const tips = await (0, groqService_1.generateAITips)(view);
        res.json({ tips });
    }
    catch (error) {
        console.error('Error generating AI tips:', error);
        res.status(500).json({ error: 'Failed to generate tips' });
    }
});
exports.default = router;
//# sourceMappingURL=aiTipsRoutes.js.map