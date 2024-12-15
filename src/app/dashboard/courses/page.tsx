'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Course {
  course_id: number;
  thumbnail: string;
  title: string;
  description: string;
  category: string;
  price: number;
}

const CoursePage = () => {
  const router = useRouter();
  const { userId, email } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCourseCreator, setIsCourseCreator] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId || !email) {
        console.error('No userId or email available');
        toast.error('Authentication required!');
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching user profile with:', { userId, email });

        const profileResponse = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'X-User-Id': userId,
            'X-User-Email': email,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('Profile Response Status:', profileResponse.status);

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error('Profile fetch error:', errorText);
          throw new Error(`Failed to fetch user profile: ${errorText}`);
        }

        const userData = await profileResponse.json();
        console.log('User Profile Data:', userData);

        setIsCourseCreator(userData.is_course_creator || false);
        console.log('Is Course Creator:', userData.is_course_creator);

        if (userData.is_course_creator) {
          const coursesResponse = await fetch('/api/mycourses', {
            method: 'GET',
            headers: {
              'X-User-Id': userId,
              'X-User-Email': email,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          console.log('Courses Response Status:', coursesResponse.status);

          if (!coursesResponse.ok) {
            const errorText = await coursesResponse.text();
            console.error('Courses fetch error:', errorText);
            throw new Error(`Failed to fetch courses: ${errorText}`);
          }

          const coursesData = await coursesResponse.json();
          console.log('Courses Data:', coursesData);
          setCourses(coursesData.courses || []);
        }

        setLoading(false);
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown Error~';
        console.error('Complete Error Object:', errMsg);
        toast.error(errMsg);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, email, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isCourseCreator) {
    return (
      <div>
        <h2>Course Creator Access Required</h2>
        <p>
          You need to enable course creator status to view or manage courses.{' '}
          <a href="/dashboard/settings" className="text-blue-500">
            Enable Course Creator Status
          </a>
        </p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div>
        <h2>No courses found</h2>
        <p>
          You havent published any courses yet.
          <a href="/dashboard/create-course" className="text-blue-500">
            Start creating one now!
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Your Published Courses</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.course_id} className="rounded-lg border p-4 shadow hover:shadow-lg">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-48 w-full rounded-md object-cover"
            />
            <h3 className="mt-2 text-lg font-semibold">{course.title}</h3>
            <p className="text-gray-600">{course.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Category: <span className="font-medium">{course.category}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Price: <span className="font-medium">₹{course.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;
