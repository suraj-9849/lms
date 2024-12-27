import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // console.log('Middleware - Token from cookie:', token);

  if (!token) {
    // console.log('Middleware - No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    // console.log('Middleware - Token verified:', decoded);

    // Clone the request headers
    const requestHeaders = new Headers(request.headers);

    // Add the user information to the headers
    requestHeaders.set('X-User-Id', decoded.userId);
    requestHeaders.set('X-User-Email', decoded.email);

    // console.log('Middleware - Headers set:', {
    //   'X-User-Id': requestHeaders.get('X-User-Id'),
    //   'X-User-Email': requestHeaders.get('X-User-Email'),
    // });

    // Return the response with modified headers
    return NextResponse.next({
      request: {
        // Pass the modified headers along with the request
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // console.error('Middleware - Token verification error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/user/:path*'],
};
