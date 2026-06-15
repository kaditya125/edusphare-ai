import express from 'express';
import multer from 'multer';
import { uploadFileDirect, getPresignedUploadUrl, getFile, deleteFile } from '../controllers/fileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Multer memory storage for direct uploads
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication middleware to all file routes
router.use(authMiddleware);

// Direct file upload using multipart/form-data
router.post('/upload', upload.single('file'), uploadFileDirect);

// Generate presigned URL for direct-to-S3 upload from frontend
router.post('/presigned-upload-url', getPresignedUploadUrl);

// Get file details and presigned download URL
router.get('/:fileId', getFile);

// Delete file
router.delete('/:fileId', deleteFile);

export default router;
