'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserSchema, CourseSchema } from '@/utils/Interfaces';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

export default function DashboardPage() {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [allCourses, setAllCourses] = useState<CourseSchema[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseSchema[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoggedIn, isLoading, userId, email } = useAuth();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!userId || !email) return;

    try {
      const [userResponse, coursesResponse] = await Promise.all([
        fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'X-User-Id': userId,
            'X-User-Email': email,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch('/api/courses', {
          method: 'GET',
          headers: {
            'X-User-Id': userId,
            'X-User-Email': email,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
      ]);

      if (!userResponse.ok || !coursesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const userData: UserSchema = await userResponse.json();
      const coursesData: CourseSchema[] = await coursesResponse.json();

      setUser(userData);
      setAllCourses(coursesData);
      setFilteredCourses(coursesData);
      setError(null);
    } catch (error) {
      // console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load data');
    }
  }, [userId, email]);

  useEffect(() => {
    if (isLoggedIn && userId && email && !user) {
      fetchData();
    } else if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, userId, email, router, fetchData, user]);

  useEffect(() => {
    const filtered = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.creator_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCourses(filtered);
  }, [searchTerm, allCourses]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        Please log in to view this page
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!user) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Welcome back, {user.display_name}!</h1>
        <p className="text-gray-600">Explore our wide range of courses below.</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses or creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          No courses found. Try adjusting your search.
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseSchema }) {
  const router = useRouter();
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <SafeImage
          src={course.image_url}
          alt={course.title}
          width={100}
          height={100}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-2 text-sm text-gray-500">{course.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.creator_avatar || undefined} />
            <AvatarFallback>{course.creator_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-500">{course.creator_name}</span>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/course/${course.course_id}`)}
        >
          <BookOpen className="mr-2 h-4 w-4" /> View Course
        </Button>
      </CardFooter>
    </Card>
  );
}
function LoadingState() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="mb-8 h-10 w-3/4" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-9 w-1/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
      <p className="mb-4 text-center text-gray-600">{error}</p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
}
