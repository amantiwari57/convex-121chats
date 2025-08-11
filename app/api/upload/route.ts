import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json();

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Only images, videos, and GIFs are supported.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `chat-media/${timestamp}-${randomId}.${fileExtension}`;

    // Create presigned URL for upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueFileName,
      ContentType: fileType,
      ChecksumAlgorithm: undefined, // Explicitly disable checksums
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // 1 hour
      signableHeaders: new Set(['host', 'content-type']),
    });

    // Generate the public URL for accessing the file
    const publicUrl = `${process.env.R2_PUBLIC_URL}/chat-app/${uniqueFileName}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      fileName: uniqueFileName,
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
