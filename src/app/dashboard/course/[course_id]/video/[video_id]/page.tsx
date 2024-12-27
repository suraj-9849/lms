'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Video } from '@/utils/Interfaces';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'; //useCallback: memoizing a function. // useEffect:to perform side effects(fetch). // useState:for state
import toast from 'react-hot-toast'; // showing the response to the user .success,.error

export default function VideoPlayerPage() {
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const videoId = params.video_id as string;
  const courseId = params.course_id as string;
  const { isLoggedIn, userId, email } = useAuth();
  const router = useRouter();

  const checkCourseAccess = useCallback(async () => {
    if (!userId || !courseId) return;

    try {
      const response = await fetch('/api/check-course-access', {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'X-Course-Id': courseId,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.isCreator || data.hasPurchased) {
        setHasAccess(true);
      } else {
        //  If not purchased:
        router.push(`/dashboard/courses/${courseId}/purchase`);
      }
    } catch (error: unknown) {
      console.error('Error checking course access:', error);
      toast.error('Failed to verify course access');
    } finally {
      setIsLoading(false);
    }
  }, [userId, courseId, router]);

  const fetchVideoData = useCallback(async () => {
    if (!videoId || !userId || !email || !courseId || !hasAccess) return;

    try {
      const response = await fetch('/api/view-video', {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'X-User-Email': email,
          'X-Video-Id': videoId,
          'X-Course-Id': courseId,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }

      const data = await response.json();
      setVideoData(data);
    } catch (error: unknown) {
      console.error('Error fetching video data:', error);
      toast.error('Failed to load video');
    }
  }, [videoId, userId, email, courseId, hasAccess]);

  useEffect(() => {
    if (isLoggedIn) {
      checkCourseAccess();
    }
  }, [isLoggedIn, checkCourseAccess]);

  useEffect(() => {
    if (hasAccess) {
      fetchVideoData();
    }
  }, [hasAccess, fetchVideoData]);

  if (!isLoggedIn || isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>
      {videoData && videoData.url && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{videoData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              className="w-full rounded-lg"
              controls
              autoPlay
              controlsList="nodownload"
              src={videoData.url}
            >
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
