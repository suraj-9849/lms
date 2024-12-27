import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest
) {
    const userId = request.headers.get("X-user-Id")
    if(!userId) return NextResponse.json({ error: 'User Id  Not Recieved' }, { status: 400 }) 
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        purchased_courses: {
          include: {
            course: {
              include: {
                creator: {
                  select: {
                    display_name: true,
                  },
                },
              },
            },
          },
        },
        created_courses: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const purchasedCourses = user.purchased_courses.map((purchase) => ({
      course_id: purchase.course.course_id,
      title: purchase.course.title,
      description: purchase.course.description,
      thumbnail: purchase.course.thumbnail,
      progress: 0,
      creator_name: purchase.course.creator.display_name,
    }))

    const createdCourses = user.created_courses.map((course) => ({
      course_id: course.course_id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      creator_name: user.display_name,
    }))

    return NextResponse.json({
      purchasedCourses,
      createdCourses,
    })
  } catch (error) {
    console.error('Error fetching user courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

