'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { UserAuthForm } from '@/components/user-auth-form';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserSchema } from '@/utils/Interfaces';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [user, setUser] = useState<UserSchema | null>(null);
  const { isLoggedIn, isLoading, userId, email } = useAuth();
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    if (!userId || !email) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'X-User-Email': email,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user profile');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? String(error) : 'An Unknown Error!';
      console.log(errMsg);
      toast.error('Failed to load user profile');
    }
  }, [userId, email]);

  useEffect(() => {
    if (isLoggedIn && userId && email && !user) {
      fetchUserProfile();
      router.push('/dashboard');
    } else if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, userId, email, router, fetchUserProfile, user]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between p-4 md:hidden">
        <div
          onClick={() => (window.location.href = '/')}
          className="flex items-center text-lg font-medium"
        >
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
        <Link href="/signup" className={cn(buttonVariants({ variant: 'ghost' }))}>
          Sign Up
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
                  &ldquo;This LMS platform has revolutionized the way we deliver and manage our
                  online courses.&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-4 py-8 md:p-8">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="absolute right-4 top-4 hidden md:right-8 md:top-8 md:block">
              <Link href="/signup" className={cn(buttonVariants({ variant: 'ghost' }))}>
                Sign Up
              </Link>
            </div>

            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>

            <UserAuthForm />

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
