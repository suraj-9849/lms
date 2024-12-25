//I will show what I will Teach here!
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { CourseData, UserSchema } from '@/utils/Interfaces';
import { useRouter, useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlayCircle, Calendar } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';

function DescriptionPage() {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const params = useParams();
  const courseId = params.course_id as string;
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
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    }
  }, [userId, email]);

  const fetchCourseData = useCallback(async () => {
    if (!courseId || !userId || !email) return;

    setIsLoadingCourse(true);
    try {
      const response = await fetch(`/api/view-course`, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'X-user-courseid': courseId,
          'X-User-Email': email,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }

      const data = await response.json();
      console.log(data);
      setCourseData(data);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
      router.push(`/dashboard/course/${courseId}/purchase`);
    } finally {
      setIsLoadingCourse(false);
    }
  }, [courseId, userId, email, router]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && userId && email && !user) {
      fetchUserProfile();
    }
  }, [isLoggedIn, userId, email, fetchUserProfile, user]);

  useEffect(() => {
    if (isLoggedIn && userId && email && courseId) {
      fetchCourseData();
    }
  }, [isLoggedIn, userId, email, courseId, fetchCourseData]);

  if (isLoading || isLoadingCourse) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="mb-6 h-8 w-[300px]" />
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-[120px] w-full" />
          ))}
        </div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view the course content.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{courseData.title}</CardTitle>
              <CardDescription>{courseData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  <span>{courseData.video_count} videos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(courseData.videos[0]?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Course Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <SafeImage
                  src={courseData.creator.profile_url}
                  alt={courseData.creator.display_name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{courseData.creator.display_name}</p>
                  <p className="text-sm text-gray-600">{courseData.creator.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>
        {courseData.videos.map((video, index) => (
          <Card key={video.video_id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <PlayCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {index + 1}. {video.title}
                    </CardTitle>
                    <CardDescription>{(video.size / 1024 / 1024).toFixed(2)} MB</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/course/${courseId}/video/${video.video_id}`)
                  }
                >
                  Watch Now
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DescriptionPage;
