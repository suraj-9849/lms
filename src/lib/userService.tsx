import prisma from './prisma';

export async function updateUserProfileImage(userId: string, imageUrl: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { profile_url: imageUrl },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile image:', error);
    throw new Error('Failed to update user profile image');
  }
}

export async function purchaseCourse(userId: string, courseId: number) {
  try {
    const purchase = await prisma.coursePurchase.create({
      data: {
        payment_status: true,
        user: { connect: { user_id: userId } },
        course: { connect: { course_id: courseId } },
      },
    });

    await prisma.course.update({
      where: { course_id: courseId },
      data: { student_count: { increment: 1 } },
    });

    return purchase;
  } catch (error) {
    console.error('Error purchasing course:', error);
    throw new Error('Failed to purchase course');
  }
}

export async function updateInstructorStatus(userId: string, isInstructor: boolean) {
  try {
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { is_course_creator: isInstructor },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating instructor status:', error);
    throw new Error('Failed to update instructor status');
  }
}

export async function getUserPurchasedCourses(userId: string) {
  try {
    const purchasedCourses = await prisma.coursePurchase.findMany({
      where: { user_id: userId, payment_status: true },
      include: { course: true },
    });
    return purchasedCourses;
  } catch (error) {
    console.error('Error fetching user purchased courses:', error);
    throw new Error('Failed to fetch user purchased courses');
  }
}

export async function getUserCreatedCourses(userId: string) {
  try {
    const createdCourses = await prisma.course.findMany({
      where: { creator_id: userId },
    });
    return createdCourses;
  } catch (error) {
    console.error('Error fetching user created courses:', error);
    throw new Error('Failed to fetch user created courses');
  }
}
