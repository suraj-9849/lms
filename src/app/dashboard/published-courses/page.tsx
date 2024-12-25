'use client';
import { useAuth } from '@/hooks/useAuth';
import { UserSchema } from '@/utils/Interfaces';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import GradualSpacing from '@/components/ui/gradual-spacing';
import { SafeImage } from '@/components/ui/SafeImage';

const CoursePage = () => {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
        <Skeleton className="mb-6 h-12 w-[250px]" />
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
            <CardDescription>Please log in to view your courses.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={fetchUserProfile}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="mb-6 h-12 w-[250px]" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <GradualSpacing
          className="font-display text-center text-xl font-bold -tracking-widest text-black dark:text-white md:text-3xl"
          text="Your Published Courses"
        />
        {user.is_course_creator && (
          <Button onClick={() => router.push('/dashboard/create-course')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
          </Button>
        )}
      </div>
      {user.is_course_creator && user.created_courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {user.created_courses.map(
            (course: {
              course_id: number;
              title: string;
              description: string;
              student_count: number;
              thumbnail: string;
            }) => (
              <Card
                key={course.course_id}
                className="flex flex-col hover:-translate-y-2 hover:transition-all hover:delay-75 hover:duration-200"
              >
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>
                    {course.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <SafeImage
                    src={course.thumbnail}
                    alt={course.title}
                    className="mb-4 h-40 w-full rounded-md object-cover"
                  />
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{course.student_count} students enrolled</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/course/${course.course_id}`)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" /> View Course
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/course/${course.course_id}/upload`)}
                  >
                    Upload
                  </Button>
                </CardFooter>
              </Card>
            ),
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Yet</CardTitle>
            <CardDescription>
              {user.is_course_creator
                ? "You haven't created any courses yet. Start by creating your first course!"
                : "You're not a course creator yet. Upgrade your account to start creating courses."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {user.is_course_creator ? (
              <Button onClick={() => router.push('/dashboard/create-course')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Course
              </Button>
            ) : (
              <Button onClick={() => router.push('/upgrade-account')}>
                Upgrade to Course Creator
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CoursePage;
