import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  //  These 2 values are being recieved from the headers passed from the frontend
  const userId = req.headers.get('X-User-Id');
  const courseId = req.headers.get('X-Course-Id');
  //  IF they are not being sent then we return back the error!
  if (!userId || !courseId) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  try {
    // Finding the course with the courseID 
    const course = await prisma.course.findUnique({
      where: { course_id: parseInt(courseId) },
      include: { creator: true }
    });
// If it doesnot exists then Return back with the error MSG
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    // If the course_creator = userID means if the course is created by the user then we need to put that the course is been Purchased set the value to true!
    if (course.creator_id === userId) {
      return NextResponse.json({ isCreator: true, hasPurchased: false });
    }
    // Changing the payment_status value to true!
    const purchase = await prisma.coursePurchase.findFirst({
      where: {
        user_id: userId,
        course_id: parseInt(courseId),
        payment_status: true
      }
    });
//  if not then set the creator value = false and send back the response to Frontend!
    return NextResponse.json({ 
      isCreator: false, 
      hasPurchased: Boolean(purchase) 
    });
  } catch (error) {
    return NextResponse.json({ error: `Server error${error}`, }, { status: 500 });
  }
}