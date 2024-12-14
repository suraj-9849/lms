import { existsOrNot } from '@/utils/db';
import { verifyPassword } from '@/utils/password';
import { signInSchema } from '@/utils/zod';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ZodValidation = signInSchema.safeParse(body);

    if (!ZodValidation.success) {
      return NextResponse.json({ msg: 'Invalid input data' }, { status: 400 });
    }

    const { email, password } = ZodValidation.data;

    const user = await existsOrNot(email);
    if (!user) {
      return NextResponse.json({ msg: 'User does not exist' }, { status: 401 });
    }
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ msg: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({  email: user.email }, JWT_SECRET, {
      expiresIn: '1d',
    });

    const response = NextResponse.json({
      msg: 'Login successful',
      user: { email: user.email, displayName: user.display_name },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
