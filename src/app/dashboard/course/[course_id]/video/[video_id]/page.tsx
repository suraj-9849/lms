'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Video } from '@/utils/Interfaces';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function VideoPlayerPage() {
  const [videoData, setVideoData] = useState<Video | null>(null);
  const params = useParams();
  const videoId = params.video_id as string;
  const courseId = params.course_id as string;
  const { isLoggedIn, userId, email } = useAuth();
  const router = useRouter();

  const fetchVideoData = useCallback(async () => {
    if (!videoId || !userId || !email || !courseId) return;

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
    } catch (error) {
      console.error('Error fetching video data:', error);
      toast.error('Failed to load video');
    }
  }, [videoId, userId, email, courseId]);

  useEffect(() => {
    if (isLoggedIn && videoId) {
      fetchVideoData();
    }
  }, [isLoggedIn, videoId, fetchVideoData]);

  if (!isLoggedIn || !videoData || !videoData.url) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>
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
    </div>
  );
}

export default VideoPlayerPage;
