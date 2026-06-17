export declare const uploadFileToS3: (fileBuffer: Buffer, originalname: string, mimetype: string) => Promise<{
    url: string;
    key: string;
}>;
export declare const deleteFileFromS3: (key: string) => Promise<void>;
export declare const generatePresignedUploadUrl: (originalname: string, mimetype: string, expiresInSeconds?: number) => Promise<{
    uploadUrl: string;
    key: string;
    fileUrl: string;
}>;
export declare const generatePresignedDownloadUrl: (key: string, expiresInSeconds?: number) => Promise<string>;
//# sourceMappingURL=s3Service.d.ts.map