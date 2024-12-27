import prisma from '@/lib/prisma';
// creating the new User:
export async function createUserInDb(email: string, displayName: string, hashedPassword: string) {
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        display_name: displayName,
      },
      select: {
        user_id: true,
        email: true,
        display_name: true,
      },
    });
    return newUser;
  } catch (error) {
    // console.error('Error:', error);
    return null;
  }
}
// user exists or Not:
export async function existsOrNot(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        user_id: true,
        email: true,
        password: true,
        display_name: true,
      },
    });
    return user;
  } catch (error) {
    // console.error('Error:', error);
    return null;
  }
}
