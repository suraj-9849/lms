import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // console.log('API Route: check-ownership called')
  
  const courseId = req.nextUrl.searchParams.get('courseId')
  const userId = req.headers.get('X-User-Id')

  // console.log('Request params:', { courseId, userId })

  if (!courseId || !userId) {
    // console.log('Missing courseId or userId')
    return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { is_course_creator: true }
    })

    // console.log('User data from database:', user)

    if (!user) {
      // console.log('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.is_course_creator) {
      // console.log('User is not a course creator')
      return NextResponse.json({ isOwner: false, reason: 'User is not a course creator' })
    }

    const course = await prisma.course.findFirst({
      where: {
        course_id: parseInt(courseId),
        creator_id: userId
      }
    })

    // console.log('Course data from database:', course)

    if (course) {
      // console.log('User is the course owner')
      return NextResponse.json({ isOwner: true })
    } else {
      // console.log('User does not own this course')
      return NextResponse.json({ isOwner: false, reason: 'User does not own this course' })
    }
  } catch (error) {
    // console.error('Error checking course ownership:', error)
    return NextResponse.json({ error: 'Failed to check course ownership' }, { status: 500 })
  }
}

