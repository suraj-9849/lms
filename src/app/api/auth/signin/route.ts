import { existsOrNot } from '@/utils/db'; // It returns the user details if he is exist in the DB
import { verifyPassword } from '@/utils/password'; // It is used to compare the salted password and the userEntered Password
import { signInSchema } from '@/utils/zod';// Zod is used for the input validation
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
interface User {
  user_id: string;
  email: string;
  password: string;
  display_name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ZodValidation = signInSchema.safeParse(body);
// If the Zod validation is not success (means the credentials which are sent from the frontend) are not in the form of signinSchema then this Error MSG IS sent back!
    if (!ZodValidation.success) {
      return NextResponse.json({ msg: 'Invalid input data' }, { status: 400 });
    }

    const { email, password } = ZodValidation.data;
    // Checking user exists or not with the respected email ID
    const user: User | null = await existsOrNot(email);
    if (!user) {
      return NextResponse.json({ msg: 'User does not exist' }, { status: 401 });
    }
    // Verifying the password! using the BCRYPTJS
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }
  
    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, {
      expiresIn: '1d',
    });
    const response = NextResponse.json({
      msg: 'Login successful',
      user: { email: user.email, displayName: user.display_name },
    });
  // Token is being set in the Developer Tools!
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    // console.log('Token set in cookie:', token);

    return response;
  } catch (error:unknown) {
    console.error('Error:', error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
