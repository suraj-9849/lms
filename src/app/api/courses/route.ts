import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, price } = body;

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
      },
    });

    return NextResponse.json({ course: creating_course });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
