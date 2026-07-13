import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { siteConfig } from '../../config/site';
import { AppError } from '../../lib/errors';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'vionsys';

export class StorageAdapter {
  /**
   * Save upload file buffer to AWS S3.
   */
  static async saveFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ url: string; filepath: string }> {
    // 1. Validate file extension and mime type
    if (!siteConfig.storage.allowedMimeTypes.includes(mimeType)) {
      throw new AppError(`File type "${mimeType}" is not allowed.`, 'INVALID_MIME_TYPE', 400);
    }

    // 2. Generate safe, unique filename
    const ext = path.extname(filename);
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueName = `uploads/${base}_${Date.now()}${ext.toLowerCase()}`;
    
    // 3. Upload to S3
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: uniqueName,
          Body: fileBuffer,
          ContentType: mimeType,
        })
      );
    } catch (err: any) {
      console.error('S3 upload error:', err);
      throw new AppError(`S3 Upload failed: ${err.message}`, 'S3_UPLOAD_ERROR', 500);
    }

    // Mapped S3 URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${uniqueName}`;

    return {
      url,
      filepath: uniqueName, // Stored key to identify the object for deletion
    };
  }

  /**
   * Delete file from AWS S3.
   */
  static async deleteFile(filepath: string): Promise<void> {
    try {
      // Remove leading slash if exists
      const key = filepath.startsWith('/') ? filepath.substring(1) : filepath;
      
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
    } catch (err: any) {
      console.warn(`Could not delete file from S3 at "${filepath}": ${err.message}`);
    }
  }
}
