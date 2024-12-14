import { createUserInDb, existsOrNot } from '@/utils/db';
import { saltAndHashPassword } from '@/utils/password';
import { signUpSchema } from '@/utils/zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ZodValidation = signUpSchema.safeParse(body);
    if (!ZodValidation.success) {
      return NextResponse.json(
        {
          msg: 'Please Enter the Right Credentials!',
        },
        { status: 400 },
      );
    }
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ msg: 'Invalid input data' }, { status: 400 });
    }

    const userExists = await existsOrNot(email);
    if (userExists) {
      return NextResponse.json({ msg: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await saltAndHashPassword(password);

    const newUser = await createUserInDb(email, username, hashedPassword);
    if (!newUser) {
      return NextResponse.json({ msg: 'Failed to create user' }, { status: 403 });
    }

    return NextResponse.json({ msg: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}
