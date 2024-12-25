import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;

  const parsedCourseId = parseInt(courseId, 10);

  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { course_id: parsedCourseId },
      include: {
        creator: {
          select: {
            user_id: true,
            display_name: true,
            profile_url: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const formattedCoursedata = {
      course_id: course.course_id,
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      rating: course.rating,
      video_count: course.video_count,
      student_count: course.student_count,
      created_at: course.created_at,
      thumbnail: course.thumbnail,
      creator_id: course.creator_id,
      creator_name: course.creator.display_name,
      creator_avatar: course.creator.profile_url,
    };

    return NextResponse.json(formattedCoursedata);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

