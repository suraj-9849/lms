import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest
) {
  // Headers:
    const userId = request.headers.get("X-user-Id")
    // Missing:
    if(!userId) return NextResponse.json({ error: 'User Id  Not Recieved' }, { status: 400 }) 
  try {
// this is used to get all the purchased courses including the courses and creator details:
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
// Missing:
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
// Sending as the array to the frontend:
    const purchasedCourses = user.purchased_courses.map((purchase) => ({
      course_id: purchase.course.course_id,
      title: purchase.course.title,
      description: purchase.course.description,
      thumbnail: purchase.course.thumbnail,
      progress: 0,
      creator_name: purchase.course.creator.display_name,
    }))
// the courses which are created by the users will have the access of his own course right so we will also send this details:
    const createdCourses = user.created_courses.map((course) => ({
      course_id: course.course_id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      creator_name: user.display_name,
    }))
// Sending details:
    return NextResponse.json({
      purchasedCourses,
      createdCourses,
    })
  } catch (error) {
    // console.error('Error fetching user courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

