import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.ENDPOINT,
  credentials: fromEnv(),
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const video = formData.get('video') as File;
    const title = formData.get('title') as string;
    const courseId = formData.get('courseId') as string;
    const uploaderId = formData.get('uploaderId') as string;

    if (!video || !title || !courseId || !uploaderId) {
      return NextResponse.json(
        { error: 'missing required fields!' },
        { status: 400 },
      );
    }

    if (video.type !== 'video/mp4') {
      return NextResponse.json(
        { error: 'invalid file type. Only MP4.' },
        { status: 400 },
      );
    }
    const fileName = `${nanoid(12)}.mp4`;

    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const command = new PutObjectCommand({
        Bucket: 'lms',
        Key: `videos/${fileName}`,
        Body: buffer,
        ContentType: video.type,
      });

      await s3.send(command);
    } catch (s3Error) {
      console.error('Error in uploading to S3:', s3Error);
      return NextResponse.json(
        { error: 'Failed! please try again.' },
        { status: 500 },
      );
    }

    let newVideo, updatedCourse;
    try {
      newVideo = await prisma.video.create({
        data: {
          title,
          filename: fileName,
          size: video.size,
          course_id: parseInt(courseId),
          uploader_id: uploaderId,
        },
      });

      console.log("Video Uploaded Successfully!")
      updatedCourse = await prisma.course.update({
        where: { course_id: parseInt(courseId) },
        data: { video_count: { increment: 1 } },
      });
    } catch (error) {
      console.error('error saving to database:', error);
      return NextResponse.json(
        { error: 'failed to save video details to the database.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: 'video uploaded successfully',
      video: newVideo,
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'please try again.' },
      { status: 500 },
    );
  }
}
