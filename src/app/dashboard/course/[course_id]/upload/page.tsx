'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
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
  // State management
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { isLoggedIn, isLoading, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;

  const checkCourseOwnership = useCallback(async () => {
    if (!userId || !courseId) {
      console.log('Course ownership check aborted: missing userId or courseId', {
        userId,
        courseId,
      });
      return;
    }

    try {
      const response = await fetch(`/api/course/check-ownership?courseId=${courseId}`, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check course ownership');
      }

      const data = await response.json();
      setIsOwner(data.isOwner);
      setOwnershipError(data.isOwner ? null : data.reason);
    } catch (error) {
      console.error('Error checking course ownership:', error);
      toast.error('Failed to verify course ownership');
      setOwnershipError('Failed to verify course ownership');
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
  }, [
    isLoggedIn,
    isLoading,
    userId,
    courseId,
    router,
    checkCourseOwnership,
    isOwner,
    ownershipError,
  ]);

  // File handling
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setVideoFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoFile || !videoTitle || !courseId) {
      toast.error('Please fill in all fields and select a video file');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', videoTitle);
    formData.append('courseId', courseId);

    try {
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      toast.success('Video uploaded successfully');
      setVideoFile(null);
      setVideoTitle('');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  // Loading state
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
              {ownershipError ||
                'You do not have permission to upload videos for this course becoz ur not the course_instructor.'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <FileUpload onChange={handleFileUpload} />
            </div>
            <Button type="submit" disabled={isUploading || !videoFile || !videoTitle}>
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
