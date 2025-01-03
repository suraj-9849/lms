'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface cd {
  title: string;
  price: number;
}

export default function PurchasePage() {
  const { course_id: courseId } = useParams(); // Getting the courseID through Params:
  const { userId } = useAuth(); // Use AuthHook
  const [courseData, setCourseData] = useState<cd | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/getcourse/`, {
          method: 'GET',
          headers: {
            'X-CourseId': courseId?.toString() || '',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // console.error('Failed to fetch course data:', response.statusText);
          return;
        }

        const data = await response.json();
        setCourseData(data);
      } catch (error: unknown) {
        console.error('Error fetching course data:', error);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handlePayment = async () => {
    if (!courseData) return;
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          userId,
          price: courseData.price,
          title: courseData.title,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error: unknown) {
      console.error('Payment error:', error);
    }
  };

  if (!courseId) return <div>Loading...</div>;
  if (!courseData) return <div>Loading course data...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Course: {courseData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Price: ${courseData.price}</p>
          <Button onClick={handlePayment}>Purchase Now</Button>
        </CardContent>
      </Card>
    </div>
  );
}
