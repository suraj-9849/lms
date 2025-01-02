'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { UserSignUpForm } from '@/components/user-signup-form';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div
        onClick={() => (window.location.href = '/')}
        className="flex items-center justify-between p-4 md:hidden"
      >
        <div className="flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          LMS Platform
        </div>
        <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Login
        </Link>
      </div>

      <div className="flex flex-1 flex-col md:grid md:grid-cols-2">
        <div className="relative flex flex-col items-center justify-between">
          <div
            onClick={() => (window.location.href = '/')}
            className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white md:flex"
          >
            <div className="relative z-20 flex items-center text-lg font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              LMS Platform
            </div>

            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  &ldquo;Join our community of learners and start your educational journey
                  today!&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-4 py-8 md:p-8">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="absolute right-4 top-4 hidden md:right-8 md:top-8 md:block">
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
                Login
              </Link>
            </div>

            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your details below to create your account
              </p>
            </div>

            <UserSignUpForm />

            <p className="text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
