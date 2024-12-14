import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    return NextResponse.json({ isAuthenticated: true })
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 })
  }
}

