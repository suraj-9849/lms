import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, price,thumbnail } = body;

    if (!title || !category || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = request.headers.get('X-User-Id');
    const userEmail = request.headers.get('X-User-Email');

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const creating_course = await prisma.course.create({
      data: {
        title,
        description: description || null,
        category,
        price,
        created_at: new Date(),
        creator_id: userId,
        thumbnail
      },
    });

    return NextResponse.json({ course: creating_course });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id');
    const userEmail = request.headers.get('X-User-Email');

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: {
            display_name: true,
            profile_url: true,
          },
        },
      },
    });

    const formattedCourses = courses.map((course) => ({
      course_id: course.course_id,
      title: course.title,
      description: course.description,
      image_url: course.thumbnail || '',
      creator_name: course.creator.display_name,
      creator_avatar: course.creator.profile_url,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const courseId = request.headers.get('X-course-Id');
    const userId = request.headers.get('X-User-Id');
    console.log(courseId,userId)
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const course = await prisma.course.findFirst({
      where: {
        course_id: parseInt(courseId),
        creator_id: userId,
      },
    });

    if (!course) {
      console.log("Course not found or unauthorized");
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }
    await prisma.video.deleteMany({
      where: {
        course_id: parseInt(courseId),
      },
    });
    console.log("Video is Deleted!")
    await prisma.course.delete({
      where: {
        course_id: parseInt(courseId),
      },
    });
    console.log("Course Deleted! successfully!")

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
