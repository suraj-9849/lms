import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromEnv } from '@aws-sdk/credential-providers';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.ENDPOINT,
  credentials: fromEnv(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    const videoId = req.headers.get('x-video-id');
    const courseId = req.headers.get('x-course-id');

    if (!userId || !userEmail || !videoId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const video = await prisma.video.findUnique({
      where: { video_id: videoId },
      include: {
        course: {
          select: {
            creator_id: true,
            purchases: {
              where: {
                user_id: userId,
                payment_status: true
              }
            }
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const hasAccess = video.course.creator_id === userId || 
                      video.course.purchases.length > 0;

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `videos/${video.filename}`
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({
      ...video,
      url: presignedUrl
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}