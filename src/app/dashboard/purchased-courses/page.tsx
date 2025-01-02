'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Play } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Course {
  course_id: number;
  title: string;
  description: string;
  thumbnail: string;
  progress?: number;
  creator_name: string;
}

function PurchasedCourses() {
  const { userId, isLoggedIn } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!isLoggedIn || !userId) return;

      try {
        const response = await fetch(`/api/purchased-courses`, {
          headers: {
            'X-user-Id': userId,
          },
        });
        const data = await response.json();
        setPurchasedCourses(data.purchasedCourses);
        setCreatedCourses(data.createdCourses);
      } catch (error: unknown) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [userId, isLoggedIn]);

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image src={course.thumbnail} alt={course.title} layout="fill" objectFit="cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 text-lg">{course.title}</CardTitle>
        <p className="mb-2 text-sm text-gray-500">By {course.creator_name}</p>
        <p className="line-clamp-2 text-sm">{course.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        {course.progress !== undefined && (
          <div className="mb-2 w-full">
            <Progress value={course.progress} className="w-full" />
            <p className="mt-1 text-xs text-gray-500">{course.progress}% complete</p>
          </div>
        )}
        <div className="flex w-full justify-between">
          <Button variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Details
          </Button>

          <Button size="sm" onClick={() => router.push(`/dashboard/course/${course.course_id}`)}>
            <Play className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="mb-6 text-2xl font-bold">My Courses</h1>
      <Tabs defaultValue="purchased">
        <TabsList className="mb-4">
          <TabsTrigger value="purchased">Purchased Courses</TabsTrigger>
          {createdCourses.length > 0 && <TabsTrigger value="created">Created Courses</TabsTrigger>}
        </TabsList>
        <TabsContent value="purchased">
          {purchasedCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {purchasedCourses.map((course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </div>
          ) : (
            <p>You havent purchased any courses yet.</p>
          )}
        </TabsContent>
        {createdCourses.length > 0 && (
          <TabsContent value="created">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {createdCourses.map((course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default PurchasedCourses;
