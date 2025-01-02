import { createUserInDb, existsOrNot } from '@/utils/db'; // Here we create the User / and also find whether the User exists or Not!
import { saltAndHashPassword } from '@/utils/password'; // Salting the password and storing in the DB
import { signUpSchema } from '@/utils/zod';// This is Used for the Input Validation
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ZodValidation = signUpSchema.safeParse(body);
    // If the Zod validation is not success (means the credentials which are sent from the frontend) are not in the form of signinSchema then this Error MSG IS sent back!
    if (!ZodValidation.success) {
      return NextResponse.json(
        {
          msg: 'Please Enter the Right Credentials!',
        },
        { status: 400 },
      );
    }
    // Getting the required entites from the body~
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ msg: 'Invalid input data' }, { status: 400 });
    }
    // Checking whether the User Exists or NOt!
    const userExists = await existsOrNot(email);
    if (userExists) {
      return NextResponse.json({ msg: 'User already exists' }, { status: 409 });
    }
    // Hashing the password using the BCRYPT.JS
    const hashedPassword = await saltAndHashPassword(password);
    // Creating the newUser and storing in the DB
    const newUser = await createUserInDb(email, username, hashedPassword);
    if (!newUser) {
      return NextResponse.json({ msg: 'Failed to create user' }, { status: 403 });
    }

    //  Success Response is sent Back to the Frontend!
    return NextResponse.json({ msg: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error:unknown) {
    console.error('Error creating user:', error);
    return NextResponse.json({ msg: 'error' }, { status: 500 });
  }
}