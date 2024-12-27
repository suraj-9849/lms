//  To get the particular course with the CourseID
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
) {
  //  Passed from the frontend via Headers
  const courseId = request.headers.get('X-CourseId');
//  Missing:
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is missing in the headers.' },
      { status: 400 }
    );
  }
//  Parsing it into integer 
  const parsedCourseId = parseInt(courseId, 10);
//  If it is not a number then send Invalid:
  if (isNaN(parsedCourseId)) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
//  Find the course and include creator in it and also select the userID, DisplayName,Profile_URL
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
// Missing:
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
// We will send this FormattedData to Frontend
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
//  Returning Statement :
    return NextResponse.json(formattedCoursedata);
  } catch (error:unknown) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

