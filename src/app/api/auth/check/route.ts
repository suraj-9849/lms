import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  // Getting the token from the developer Tools!
  const token = request.cookies.get('token')?.value;

  // console.log('Token from cookie:', token);

  if (!token) {
    return NextResponse.json(
      { isAuthenticated: false, userId: null, error: 'No token found' },
      { status: 401 },
    );
  }

  try {
    // We need to verify the token by using the JWT 
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    // console.log('Decoded token:', decoded);
    // If success then send it to the frontend else error!
    return NextResponse.json({
      isAuthenticated: true,
      userId: decoded.userId,
      email: decoded.email,
    });
  } catch (error:unknown) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { isAuthenticated: false, userId: null, error: 'Invalid token' },
      { status: 401 },
    );
  }
}