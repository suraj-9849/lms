
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';
import prisma from '@/lib/prisma';
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.ENDPOINT,
  credentials: fromEnv(),
});
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const video = formData.get('video') as File;
    const title = formData.get('title') as string;
    const courseId = formData.get('courseId') as string;
    const uploaderId = formData.get('uploaderId') as string;

    if (!video || !title || !courseId || !uploaderId) {
      return NextResponse.json(
        { error: 'Missing required fields!' },
        { status: 400 }
      );
    }

    // Read the file as ArrayBuffer
    const buffer = Buffer.from(await video.arrayBuffer());

    // Generate filename
    const fileName = `${nanoid(12)}.mp4`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `videos/${fileName}`,
        Body: buffer,
        ContentType: video.type,
      });

      await s3.send(command);
    } catch (s3Error) {
      console.error('Error uploading to S3:', s3Error);
      return NextResponse.json(
        { error: 'Failed to upload to storage. Please try again.' },
        { status: 500 }
      );
    }

    try {
      const newVideo = await prisma.video.create({
        data: {
          title,
          filename: fileName,
          size: buffer.length,
          course_id: parseInt(courseId),
          uploader_id: uploaderId,
        },
      });

      const updatedCourse = await prisma.course.update({
        where: { course_id: parseInt(courseId) },
        data: { video_count: { increment: 1 } },
      });

      return NextResponse.json({
        message: 'Video uploaded successfully',
        video: newVideo,
        course: updatedCourse,
      });
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      return NextResponse.json(
        { error: 'Failed to save video details to the database.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}