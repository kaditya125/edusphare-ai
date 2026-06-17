"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedDownloadUrl = exports.generatePresignedUploadUrl = exports.deleteFileFromS3 = exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
const getBucketName = () => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error('AWS_S3_BUCKET_NAME is not configured');
    }
    return bucketName;
};
const uploadFileToS3 = async (fileBuffer, originalname, mimetype) => {
    const bucketName = getBucketName();
    const fileExtension = originalname.split('.').pop();
    const fileName = `uploads/${(0, uuid_1.v4)()}.${fileExtension}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
    });
    await s3Client.send(command);
    return {
        url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
        key: fileName
    };
};
exports.uploadFileToS3 = uploadFileToS3;
const deleteFileFromS3 = async (key) => {
    const bucketName = getBucketName();
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    await s3Client.send(command);
};
exports.deleteFileFromS3 = deleteFileFromS3;
const generatePresignedUploadUrl = async (originalname, mimetype, expiresInSeconds = 3600) => {
    const bucketName = getBucketName();
    const fileExtension = originalname.split('.').pop();
    const fileName = `uploads/presigned/${(0, uuid_1.v4)()}.${fileExtension}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: mimetype,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: expiresInSeconds });
    return {
        uploadUrl,
        key: fileName,
        fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    };
};
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
const generatePresignedDownloadUrl = async (key, expiresInSeconds = 3600) => {
    const bucketName = getBucketName();
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: expiresInSeconds });
};
exports.generatePresignedDownloadUrl = generatePresignedDownloadUrl;
//# sourceMappingURL=s3Service.js.map