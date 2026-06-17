"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fileController_1 = require("../controllers/fileController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Multer memory storage for direct uploads
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Apply authentication middleware to all file routes
router.use(authMiddleware_1.authMiddleware);
// Direct file upload using multipart/form-data
router.post('/upload', upload.single('file'), fileController_1.uploadFileDirect);
// Generate presigned URL for direct-to-S3 upload from frontend
router.post('/presigned-upload-url', fileController_1.getPresignedUploadUrl);
// Get file details and presigned download URL
router.get('/:fileId', fileController_1.getFile);
// Delete file
router.delete('/:fileId', fileController_1.deleteFile);
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map