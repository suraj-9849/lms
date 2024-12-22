//I will show what I will Teach here!
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { UserSchema } from '@/utils/Interfaces';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
function DescriptionPage() {
  const [user, setUser] = useState<UserSchema | null>(null);
  const { isLoggedIn, isLoading, userId, email } = useAuth();
  const router = useRouter();

  // Memoized fetch user profile function
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
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    }
  }, [userId, email]);

  useEffect(() => {
    if (isLoggedIn && userId && email && !user) {
      fetchUserProfile();
    } else if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, userId, email, router, fetchUserProfile, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="mb-6 h-6 w-[250px]" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to See Description of your courses.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <div>I will describe about the course</div>;
}

export default DescriptionPage;
