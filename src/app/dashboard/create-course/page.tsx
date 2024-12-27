'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, DollarSign, Plus, Tag, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { filetoDataURL } from 'image-conversion'; // Converting the image into the url
import { FileUpload } from '@/components/ui/file-upload';
import { SafeImage } from '@/components/ui/SafeImage';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userId, email } = useAuth();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
    thumbnail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> : event type for the onChange Event:
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };
  // from aceternity UI:
  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      try {
        const thumbnailUrl = await filetoDataURL(file);
        setFormData((prev) => ({ ...prev, thumbnail: thumbnailUrl }));
      } catch (error: unknown) {
        console.error('Error converting thumbnail:', error);
        toast.error('Failed to process thumbnail image');
      }
    }
  };
  //  FormEvent -> Types for the form event:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Not LoggedIn
    if (!isLoggedIn) {
      toast.error('You must be logged in to create a course');
      router.push('/login');
      return;
    }
    // MIssing:
    if (!formData.title || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
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
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();

      if (!userData.is_course_creator) {
        toast.error('You must enable course creator status to create a course');
        return;
      }

      const createCourseResponse = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'X-User-Id': userId,
          'X-User-Email': email,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price.toFixed(2)),
        }),
        credentials: 'include',
      });

      if (!createCourseResponse.ok) {
        const errorData = await createCourseResponse.json();
        throw new Error(errorData.error || 'Failed to create course');
      }

      const newCourse = await createCourseResponse.json();
      console.log(newCourse);
      toast.success('Course created successfully!');
      router.push(`/dashboard/published-courses/`);
    } catch (error) {
      // console.error('Error creating course:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isLoggedIn) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center text-xl font-bold">
            <Plus className="mr-2 h-6 w-6" />
            Create New Course
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">
                    <BookOpen className="mr-2 inline h-5 w-5" />
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-lg font-medium">
                    <Tag className="mr-2 inline h-5 w-5" />
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="Enter course category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-lg font-medium">
                    <DollarSign className="mr-2 inline h-5 w-5" />
                    Price (in USD)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Course price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-lg font-medium">
                    Course Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide a brief description of your course"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 h-32"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoFile" className="text-lg font-medium">
                    <Upload className="mr-2 inline h-5 w-5" />
                    Thumbnail
                  </Label>
                  <FileUpload onChange={handleFileUpload} />
                </div>
                {formData.thumbnail && (
                  <div className="mt-4">
                    <Label className="text-lg font-medium">Thumbnail Preview</Label>
                    <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg">
                      <SafeImage
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="h-12 w-full text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Course...' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
