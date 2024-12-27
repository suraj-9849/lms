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
    //  Getting the Headers:
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    const videoId = req.headers.get('x-video-id');
    const courseId = req.headers.get('x-course-id');
// MIssing:
    if (!userId || !userEmail || !videoId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First check if user has purchased the course
    const coursePurchase = await prisma.coursePurchase.findFirst({
      where: {
        user_id: userId,
        course_id: parseInt(courseId),
        payment_status: true
      }
    });

    // Then get video and check if user is creator
    const video = await prisma.video.findUnique({
      where: { 
        video_id: videoId,
        course_id: parseInt(courseId) 
      },
      include: {
        course: {
          select: {
            creator_id: true,
            title: true
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
// If the user is the courseCreator
    const isCreator = video.course.creator_id === userId;
    const hasPurchased = !!coursePurchase;
// Not purchased:
    if (!isCreator && !hasPurchased) {
      return NextResponse.json({
        error: 'Purchase required',
        courseId: courseId,
        courseTitle: video.course.title,
        requiresPurchase: true
      }, { status: 403 });
    }
// Getting the video:
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `videos/${video.filename}`
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({
      ...video,
      url: presignedUrl
    });
  } catch (error:unknown) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}