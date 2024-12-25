import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('X-User-Id');
  const courseId = req.headers.get('X-Course-Id');

  if (!userId || !courseId) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { course_id: parseInt(courseId) },
      include: { creator: true }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.creator_id === userId) {
      return NextResponse.json({ isCreator: true, hasPurchased: false });
    }

    const purchase = await prisma.coursePurchase.findFirst({
      where: {
        user_id: userId,
        course_id: parseInt(courseId),
        payment_status: true
      }
    });

    return NextResponse.json({ 
      isCreator: false, 
      hasPurchased: Boolean(purchase) 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}