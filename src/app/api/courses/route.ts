import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // req.body()
    const body = await request.json();
    // Extract all the values which are coming from the frontend
    const { title, description, category, price, thumbnail } = body;
    //  send back the error if they are not being passed!
    if (!title || !category || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    //  These 2 values are being recieved from the headers passed from the frontend
    const userId = request.headers.get('X-User-Id');
    const userEmail = request.headers.get('X-User-Email');
    // Missing:
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Finding the User!
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });
    //  Missing:
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    //  Creating the course!
    const creating_course = await prisma.course.create({
      data: {
        title,
        description: description || null,
        category,
        price,
        created_at: new Date(),
        creator_id: userId,
        thumbnail,
      },
    });
    // Resing the response to Frontend
    return NextResponse.json({ course: creating_course });
  } catch (error) {
    // console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    //  These 2 values are being recieved from the headers passed from the frontend
    const userId = request.headers.get('X-User-Id');
    const userEmail = request.headers.get('X-User-Email');
    //  Missing:
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Finding the course:This keyword tells Prisma:
    // "Also fetch related data (like the creator) along with each course."
    // select
    // Within include, we can use select to fetch only specific fields from the Creator model.
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
//  Retuning the formatted Data:
    return NextResponse.json(formattedCourses);
  } catch (error) {
    // console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    
  //  These 2 values are being recieved from the headers passed from the frontend
    const courseId = request.headers.get('X-course-Id');
    const userId = request.headers.get('X-User-Id');
    // console.log(courseId,userId)
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Finding The course
    const course = await prisma.course.findFirst({
      where: {
        course_id: parseInt(courseId),
        creator_id: userId,
      },
    });

    if (!course) {
      // console.log("Course not found or unauthorized");
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }
    //  Deleting the Videos which is present with the courseID:
    await prisma.video.deleteMany({
      where: {
        course_id: parseInt(courseId),
      },
    });
    // console.log("Video is Deleted!")
    
    //  Deleting the Course which is present with the courseID:
    await prisma.course.delete({
      where: {
        course_id: parseInt(courseId),
      },
    });
    // console.log("Course Deleted! successfully!")
//  Success MSG:
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    // console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
