"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFile = exports.getPresignedUploadUrl = exports.uploadFileDirect = void 0;
const express_1 = require("express");
const File_1 = __importDefault(require("../models/File"));
const s3Service_1 = require("../services/s3Service");
const uploadFileDirect = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file provided' });
            return;
        }
        const { buffer, originalname, mimetype, size } = req.file;
        const { url, key } = await (0, s3Service_1.uploadFileToS3)(buffer, originalname, mimetype);
        const newFile = new File_1.default({
            s3Key: key,
            url,
            originalName: originalname,
            contentType: mimetype,
            size,
            uploader: req.user?._id
        });
        await newFile.save();
        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Server error during file upload' });
    }
};
exports.uploadFileDirect = uploadFileDirect;
const getPresignedUploadUrl = async (req, res) => {
    try {
        const { originalName, contentType, size } = req.body;
        if (!originalName || !contentType || !size) {
            res.status(400).json({ message: 'originalName, contentType, and size are required' });
            return;
        }
        const { uploadUrl, key, fileUrl } = await (0, s3Service_1.generatePresignedUploadUrl)(originalName, contentType);
        // Save metadata placeholder in MongoDB before upload
        const newFile = new File_1.default({
            s3Key: key,
            url: fileUrl,
            originalName: originalName,
            contentType: contentType,
            size: size,
            uploader: req.user?._id
        });
        await newFile.save();
        res.status(200).json({ uploadUrl, file: newFile });
    }
    catch (error) {
        console.error('Error generating presigned upload URL:', error);
        res.status(500).json({ message: 'Server error generating upload URL' });
    }
};
exports.getPresignedUploadUrl = getPresignedUploadUrl;
const getFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const file = await File_1.default.findById(fileId);
        if (!file) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        const downloadUrl = await (0, s3Service_1.generatePresignedDownloadUrl)(file.s3Key);
        res.status(200).json({ file, downloadUrl });
    }
    catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).json({ message: 'Server error retrieving file' });
    }
};
exports.getFile = getFile;
const deleteFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const file = await File_1.default.findById(fileId);
        if (!file) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        if (file.uploader.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized to delete this file' });
            return;
        }
        await (0, s3Service_1.deleteFileFromS3)(file.s3Key);
        await File_1.default.findByIdAndDelete(fileId);
        res.status(200).json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Server error deleting file' });
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=fileController.js.map