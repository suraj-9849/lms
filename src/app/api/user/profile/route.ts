import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('Profile API route called')
  console.log('Headers received:', Object.fromEntries(request.headers.entries()))
  // These are being passed from the Frontend:
  const userId = request.headers.get('X-User-Id') 
  const userEmail = request.headers.get('X-User-Email')
  
  if (!userId || !userEmail) {
    console.log('No user ID or email found in headers')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  console.log('User ID from headers:', userId)
  console.log('User email from headers:', userEmail)

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        purchased_courses: {
          include: { course: true }
        },
        created_courses: true
      }
    })

    if (!user) {
      console.log('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found:', user.email)
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const userId = request.headers.get('X-User-Id')
  
  if (!userId) {
    console.log('No user ID found in headers')
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { profile_url, is_course_creator } = body

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        ...(profile_url && { profile_url }),
        ...(is_course_creator !== undefined && { is_course_creator })
      }
    })
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

