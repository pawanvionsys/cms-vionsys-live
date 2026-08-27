import { S3Client } from '@aws-sdk/client-s3';

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export function getS3Config() {
  const accessKeyId = readEnv('ACCESS_KEY_ID');
  const secretAccessKey = readEnv('SECRET_ACCESS_KEY');
  const region = readEnv('REGION') || 'ap-south-1';
  const bucket = readEnv('BUCKET') || 'vionsys';

  return { accessKeyId, secretAccessKey, region, bucket };
}

export function createS3Client() {
  const { accessKeyId, secretAccessKey, region } = getS3Config();

  return new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        }
      : {}),
  });
}

export function assertS3Configured(): void {
  const { accessKeyId, secretAccessKey, bucket } = getS3Config();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'S3 credentials are not configured. Set ACCESS_KEY_ID and SECRET_ACCESS_KEY in environment variables.'
    );
  }

  if (!bucket) {
    throw new Error(
      'S3 bucket is not configured. Set BUCKET in environment variables.'
    );
  }
}
