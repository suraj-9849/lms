'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface CourseFormData {
  title: string;
  description?: string;
  category: string;
  price: number;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userId, email } = useAuth();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('You must be logged in to create a course');
      router.push('/login');
      return;
    }

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
      console.error('Error creating course:', error);
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
    <div className="container mx-auto py-10">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-6 w-6" />
            Create New Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a brief description of your course"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="Enter course category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (in USD)</Label>
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
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Course...' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
