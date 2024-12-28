'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';

export default function UploadPage() {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isCheckingOwnership, setIsCheckingOwnership] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { isLoggedIn, isLoading, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;

  const checkCourseOwnership = useCallback(async () => {
    if (!userId || !courseId) return;

    setIsCheckingOwnership(true);
    try {
      const response = await fetch(`/api/course/check-ownership?courseId=${courseId}`, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to check course ownership');

      const data = await response.json();
      setIsOwner(data.isOwner);
      setOwnershipError(data.isOwner ? null : data.reason);
    } catch (error) {
      console.error('Error checking course ownership:', error);
      toast.error('Failed to verify course ownership');
      setOwnershipError('Failed to verify course ownership');
    } finally {
      setIsCheckingOwnership(false);
    }
  }, [userId, courseId]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }

    if (isLoggedIn && userId && courseId) {
      checkCourseOwnership();
    }
  }, [isLoggedIn, isLoading, userId, courseId, router, checkCourseOwnership]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'video/mp4') {
      toast.error('Only MP4 videos are supported');
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); // From Java
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setVideoBase64(base64);
    } catch (error) {
      console.error('Error converting video to base64:', error);
      toast.error('Failed to process video file');
    }
  };

  const handleUpload = async () => {
    if (!videoBase64 || !videoTitle || !courseId || !userId) {
      toast.error('Please fill in all fields and select a video file');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video: videoBase64,
          title: videoTitle,
          courseId: courseId,
          uploaderId: userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to upload video');

      toast.success('Video uploaded successfully');
      setVideoBase64(null);
      setVideoTitle('');
      router.push('/dashboard/published-courses');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || isCheckingOwnership) {
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
            <CardDescription>Please log in to upload videos for your courses.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {ownershipError || 'You do not have permission to upload videos for this course.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Course Video</CardTitle>
          <CardDescription>Add a new video to your course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="videoTitle">Video Title</Label>
              <Input
                id="videoTitle"
                type="text"
                placeholder="Enter video title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="videoFile">Video File</Label>
              <Input
                id="videoFile"
                type="file"
                accept="video/mp4"
                onChange={handleFileChange}
                required
              />
            </div>
            <Button onClick={handleUpload} disabled={isUploading || !videoBase64 || !videoTitle}>
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
