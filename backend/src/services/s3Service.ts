import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
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
}

export const uploadFileToS3 = async (fileBuffer: Buffer, originalname: string, mimetype: string): Promise<{ url: string, key: string }> => {
  const bucketName = getBucketName();
  const fileExtension = originalname.split('.').pop();
  const fileName = `uploads/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
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

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  const bucketName = getBucketName();
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
};

export const generatePresignedUploadUrl = async (originalname: string, mimetype: string, expiresInSeconds: number = 3600): Promise<{ uploadUrl: string, key: string, fileUrl: string }> => {
  const bucketName = getBucketName();
  const fileExtension = originalname.split('.').pop();
  const fileName = `uploads/presigned/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: mimetype,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  
  return {
    uploadUrl,
    key: fileName,
    fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
  };
};

export const generatePresignedDownloadUrl = async (key: string, expiresInSeconds: number = 3600): Promise<string> => {
  const bucketName = getBucketName();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};
