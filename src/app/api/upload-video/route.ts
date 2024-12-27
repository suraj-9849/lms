import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid'; // Generates the ID
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // for storing the videos
import { fromEnv } from '@aws-sdk/credential-providers'; //  credentials providers like accessKey,secret key which are present in the .env are placed in the credentials field
import prisma from '@/lib/prisma';// Prisma Client with the singleton!

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.ENDPOINT,
  credentials: fromEnv(),
});


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData(); // Getting the form data!
    //  Retrieving all the details from the formData
    const video = formData.get('video') as File; 
    const title = formData.get('title') as string;
    const courseId = formData.get('courseId') as string;
    const uploaderId = formData.get('uploaderId') as string;
// Missing:
    if (!video || !title || !courseId || !uploaderId) {
      return NextResponse.json(
        { error: 'missing required fields!' },
        { status: 400 },
      );
    }
// Invalid File Type:
    if (video.type !== 'video/mp4') {
      return NextResponse.json(
        { error: 'invalid file type. Only MP4.' },
        { status: 400 },
      );
    }
    // Generating the filename with the nanoID as the name:
    const fileName = `${nanoid(12)}.mp4`;
//  Converting the video into Bytes:
    const bytes = await video.arrayBuffer();
    // converting the bytes data into the buffer
    const buffer = Buffer.from(bytes);

    try {
      // Putting the object into the s3 bucket:
      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `videos/${fileName}`,
        Body: buffer,
        ContentType: video.type,
      });

      await s3.send(command);
    } catch (s3Error) {
      // console.error('Error in uploading to S3:', s3Error);
      return NextResponse.json(
        { error: 'Failed! please try again.' },
        { status: 500 },
      );
    }
// Creating the Video details in the DB:
    let newVideo, updatedCourse;
    try {
      newVideo = await prisma.video.create({
        data: {
          title,
          filename: fileName, // main at the getting the video time also!
          size: video.size,
          course_id: parseInt(courseId),
          uploader_id: uploaderId,
        },
      });

      // console.log("Video Uploaded Successfully!")
      // Updating the count = count+1
      updatedCourse = await prisma.course.update({
        where: { course_id: parseInt(courseId) },
        data: { video_count: { increment: 1 } },
      });
    } catch (error) {
      // console.error('error saving to database:', error);
      return NextResponse.json(
        { error: 'failed to save video details to the database.' },
        { status: 500 },
      );
    }
//  sending the success msg and data to the frontend:
    return NextResponse.json({
      message: 'video uploaded successfully',
      video: newVideo,
      course: updatedCourse,
    });
  } catch (error) {
    // console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'please try again.' },
      { status: 500 },
    );
  }
}
