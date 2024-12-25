import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('courseId');
  const userId = searchParams.get('userId');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_BASE_URL is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (!sessionId || !courseId || !userId) {
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      await prisma.coursePurchase.create({
        data: {
          course_id: parseInt(courseId),
          user_id: userId,
          payment_status: true,
        },
      });
      
      return NextResponse.redirect(`${baseUrl}/dashboard/course/${courseId}`);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
  }

  return NextResponse.redirect(`${baseUrl}/dashboard`);
}

