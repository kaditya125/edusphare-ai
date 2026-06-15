import { Request, Response } from 'express';
import File from '../models/File';
import { uploadFileToS3, deleteFileFromS3, generatePresignedUploadUrl, generatePresignedDownloadUrl } from '../services/s3Service';

export const uploadFileDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }

    const { buffer, originalname, mimetype, size } = req.file;

    const { url, key } = await uploadFileToS3(buffer, originalname, mimetype);

    const newFile = new File({
      s3Key: key,
      url,
      originalName: originalname,
      contentType: mimetype,
      size,
      uploader: req.user?._id
    });

    await newFile.save();

    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

export const getPresignedUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalName, contentType, size } = req.body;

    if (!originalName || !contentType || !size) {
      res.status(400).json({ message: 'originalName, contentType, and size are required' });
      return;
    }

    const { uploadUrl, key, fileUrl } = await generatePresignedUploadUrl(originalName, contentType);

    // Save metadata placeholder in MongoDB before upload
    const newFile = new File({
      s3Key: key,
      url: fileUrl,
      originalName: originalName,
      contentType: contentType,
      size: size,
      uploader: req.user?._id
    });

    await newFile.save();

    res.status(200).json({ uploadUrl, file: newFile });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    res.status(500).json({ message: 'Server error generating upload URL' });
  }
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);

    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    const downloadUrl = await generatePresignedDownloadUrl(file.s3Key);

    res.status(200).json({ file, downloadUrl });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ message: 'Server error retrieving file' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);

    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    if (file.uploader.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this file' });
      return;
    }

    await deleteFileFromS3(file.s3Key);
    await File.findByIdAndDelete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error deleting file' });
  }
};
