import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';// Payment Gateway!
// Must required Field that why I kept !(Exclamation mark) 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    //req.json = req.body
    const { courseId, userId, price, title } = await req.json();
    //  This code will creates the checkout session page with details which are passed by the frontend and retireved here by req.json()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            // Currency in INR
            currency: 'inr',
            product_data: {
              name: title,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      //  The successURL:
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}&userId=${userId}`,
      // Cancel URL:
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    return NextResponse.json({ error: `Error creating checkout session${error}` }, { status: 500 });
  }
}
