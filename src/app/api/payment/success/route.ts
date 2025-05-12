import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';


export async function GET(req: NextRequest) {
  //  Getting the params!
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('courseId');
  const userId = searchParams.get('userId');
// BaseURl : 
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
// MIssing
  if (!baseUrl) {
    // console.error('NEXT_PUBLIC_BASE_URL is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
// Missing:
  if (!sessionId || !courseId || !userId) {
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  }

  try {
    // Getting the session id and storing in the session:
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    //  Checking whether it is paid-> if Paid then update the payment_status = true so that he can access the course
    if (session.payment_status === 'paid') {
      await prisma.coursePurchase.create({
        data: {
          course_id: parseInt(courseId),
          user_id: userId,
          payment_status: true,
        },
      });
      // If it is success then we will redirect him to the respected course he want to purchase: by using the redirect()
      return NextResponse.redirect(`${baseUrl}/dashboard/course/${courseId}`);
    }
  } catch (error:unknown) {
    console.error('Payment verification error:', error);
  }
// If it is not successfully then sending back th /dashboard page!
  return NextResponse.redirect(`${baseUrl}/dashboard`);
}

