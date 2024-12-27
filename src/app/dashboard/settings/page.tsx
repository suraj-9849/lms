'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CourseCard } from '@/components/course-card';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserSchema } from '@/utils/Interfaces';
import { Trash2 } from 'lucide-react';

function Page() {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
    } catch (error) {
      // console.error('Error fetching user profile:', error);
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
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <div>Please log in to view this page</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div className="flex min-h-[70vh] items-center justify-center">Loading...</div>;
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!userId || !email || !courseId) return null;
    try {
      const response = await fetch(`/api/courses`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId || '',
          'X-User-Email': email || '',
          'X-course-Id': courseId.toString(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          created_courses: prevUser.created_courses.filter(
            (course) => course.course_id !== courseId,
          ),
        };
      });

      toast.success('Course deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  return (
    <div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {user.created_courses &&
          user.created_courses.map((course) => (
            <div key={course.course_id} className="relative">
              <CourseCard
                title={course.title}
                description={course.description || ''}
                image={course.thumbnail}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="absolute right-2 top-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {course.title}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteCourse(course.course_id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Page;
