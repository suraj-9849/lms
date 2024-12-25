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
    const course_id = req.headers.get('x-user-courseid');

    console.log('Checking access for:', { userId, courseId: course_id });

    if (!userId || !userEmail || !course_id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 401 }
      );
    }

    const courseId = parseInt(course_id);

    // First check if user is the creator
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: {
        creator_id: true,
        title: true,
        price: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Creator check:', { isCreator: course.creator_id === userId });

    // If not creator, check for purchase
    if (course.creator_id !== userId) {
      const purchase = await prisma.coursePurchase.findFirst({
        where: {
          course_id: courseId,
          user_id: userId,
          payment_status: true
        }
      });

      console.log('Purchase check:', { hasPurchase: !!purchase });

      if (!purchase) {
        return NextResponse.json({
          error: 'Purchase required',
          requiresPurchase: true,
          courseId: courseId,
          courseTitle: course.title,
          price: course.price
        }, { status: 403 });
      }
    }

    // Fetch full course details if access is granted
    const fullCourse = await prisma.course.findUnique({
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

    const videosWithUrls = await Promise.all(
      fullCourse!.videos.map(async (video) => {
        const command = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: `videos/${video.filename}`
        });

        try {
          const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
          return { ...video, url: presignedUrl };
        } catch (error) {
          console.error(`Error generating presigned URL for video ${video.video_id}:`, error);
          return { ...video, url: null };
        }
      })
    );

    return NextResponse.json({
      ...fullCourse,
      videos: videosWithUrls,
      video_count: fullCourse!.videos.length
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}