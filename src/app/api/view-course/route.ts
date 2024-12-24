// app/api/view-course/[course_id]/route.ts

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

export async function GET(
  req: NextRequest
) {
  try {
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');
    const course_id = req.headers.get('x-user-courseid');
    if (!userId || !userEmail||!course_id) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const courseId = parseInt(course_id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const purchase = await prisma.coursePurchase.findFirst({
      where: {
        course_id: courseId,
        user_id: userId,
        payment_status: true
      }
    });

    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { creator_id: true }
    });

    if (!purchase && course?.creator_id !== userId) {
      return NextResponse.json(
        { error: "You don't have access to this course" },
        { status: 403 }
      );
    }

    const courseDetails = await prisma.course.findUnique({
      where: { course_id: courseId },
      include: {
        videos: {
          orderBy: { created_at: 'asc' },
          select: {
            video_id: true,
            title: true,
            filename: true,
            created_at: true,
            size: true,
            updated_at: true
          }
        },
        creator: {
          select: {
            display_name: true,
            profile_url: true,
            email: true,
            is_course_creator: true
          }
        }
      }
    });

    if (!courseDetails) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const videosWithUrls = await Promise.all(
      courseDetails.videos.map(async (video) => {
        const command = new GetObjectCommand({
          Bucket: 'lms',
          Key: `videos/${video.filename}`
        });

        try {
          const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
          
          return {
            ...video,
            url: presignedUrl
          };
        } catch (error) {
          console.error(`Error generating presigned URL for video ${video.video_id}:`, error);
          return {
            ...video,
            url: null
          };
        }
      })
    );

    const transformedResponse = {
      ...courseDetails,
      videos: videosWithUrls,
      video_count: courseDetails.videos.length,
      total_duration: courseDetails.videos.reduce((acc, video) => acc + video.size, 0),
      last_updated: courseDetails.videos.length > 0
        ? Math.max(...courseDetails.videos.map(v => new Date(v.updated_at).getTime()))
        : new Date(courseDetails.created_at).getTime()
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}