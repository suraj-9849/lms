// Main Page for getting the user Details:
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // console.log('Profile API route called');
  // console.log('Headers received:', Object.fromEntries(request.headers.entries()));
  // These are being passed from the Frontend:
  const userId = request.headers.get('X-User-Id');
  const userEmail = request.headers.get('X-User-Email');

  if (!userId || !userEmail) {
    // console.log('No user ID or email found in headers');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // console.log('User ID from headers:', userId);
  // console.log('User email from headers:', userEmail);

  try {
    // Finding the User:
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        purchased_courses: {
          include: { course: true },
        },
        created_courses: true,
      },
    });
// Missing:
    if (!user) {
      // console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // console.log('User found:', user.email);
    // Linting error :
    /* eslint-disable */
    const { password, ...userWithoutPassword } = user;
    /* eslint-enable */
    // sending the details
    return NextResponse.json(userWithoutPassword);
  } catch (error:unknown) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Updating route = PUT:
  // Getting the details from the Headers:
  const userId = request.headers.get('X-User-Id');
// Missing:
  if (!userId) {
    // console.log('No user ID found in headers');
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // req.json= req.body
    const body = await request.json();
    // Getting all the details from the body:
    const { profile_url, is_course_creator } = body;
// Updating the profile_URL and courseCreator in DB:
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {

        ...(profile_url && { profile_url }),
        ...(is_course_creator !== undefined && { is_course_creator }),
      },
    });
    // Linting Error:
    /* eslint-disable */
    // putting the user data into  userWithoutPassword except the password: 
    const { password, ...userWithoutPassword } = updatedUser;
    /* eslint-enable */
    // sending back the data to the frontend
    return NextResponse.json(userWithoutPassword);
  } catch (error:unknown) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
