import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('My Courses GET route called');

  const userId = request.headers.get('X-User-Id');
  const userEmail = request.headers.get('X-User-Email');

  console.log('Received User ID:', userId);
  console.log('Received User Email:', userEmail);

  if (!userId || !userEmail) {
    console.warn('No user ID or email found in headers');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        is_course_creator: true,
        email: true,
      },
    });

    console.log('User found:', user);

    if (!user) {
      console.warn('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email !== userEmail) {
      console.warn('Email mismatch', { dbEmail: user.email, headerEmail: userEmail });
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    if (!user.is_course_creator) {
      console.log('User is not a course creator');
      return NextResponse.json(
        {
          courses: [],
          message: 'User is not a course creator',
        },
        { status: 200 },
      );
    }
    const courses = await prisma.course.findMany({
      where: { creator_id: userId },
      select: {
        course_id: true,
        thumbnail: true,
        title: true,
        description: true,
        category: true,
        price: true,
      },
    });

    console.log('Courses found:', courses.length);

    return NextResponse.json(
      {
        courses: courses,
        message: 'Courses retrieved successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
export async function POST() {
  console.warn('Attempted POST to /api/mycourses');
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT() {
  console.warn('Attempted PUT to /api/mycourses');
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
