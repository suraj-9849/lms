'use client';
import { useState, useEffect, useCallback } from 'react';
import { User, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard } from '@/components/course-card';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserSchema } from '@/utils/Interfaces';

export default function ProfilePage() {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, isLoading, userId, email } = useAuth();
  const router = useRouter();

  //  useCallback: to memoize the fetchUserProfile
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
      console.error('Error fetching user profile:', error);
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
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile_url: imageUrl }),
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to update profile image');
          }
          const updatedUser = await response.json();
          setUser(updatedUser);
          toast.success('Profile image updated successfully');
        } catch (error) {
          console.error('Error updating profile image:', error);
          toast.error('Failed to update profile image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = async (isCourseCreator: boolean) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_course_creator: isCourseCreator }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success(`You are now ${isCourseCreator ? 'a course creator' : 'a student'}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

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
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto w-full max-w-4xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.profile_url || undefined} />
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="image-upload"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground"
              >
                <Upload className="h-4 w-4" />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <h2 className="text-2xl font-bold">{user.display_name}</h2>
            <p className="text-muted-foreground">{user.email}</p>

            {!user.is_course_creator && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Become a Course Creator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Become a Course Creator</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to become a course creator?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 flex justify-center space-x-4">
                    <Button onClick={() => handleRoleChange(true)}>Yes, I&apos;m sure</Button>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Tabs defaultValue="purchased" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchased">Courses Purchased</TabsTrigger>
              {user.is_course_creator && (
                <TabsTrigger value="published">Courses Published</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="purchased">
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.purchased_courses.map((purchase) => (
                  <CourseCard
                    key={purchase.course.course_id}
                    title={purchase.course.title}
                    description={purchase.course.description || ''}
                    image="/placeholder.svg?height=100&width=200"
                    progress={0}
                  />
                ))}
              </div>
            </TabsContent>
            {user.is_course_creator && (
              <TabsContent value="published">
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user.created_courses.map((course) => (
                    <CourseCard
                      key={course.course_id}
                      title={course.title}
                      description={course.description || ''}
                      image="/placeholder.svg?height=100&width=200"
                      students={course.student_count}
                    />
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}