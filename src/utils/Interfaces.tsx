export interface PurchasedCourse {
  course: {
    course_id: string;
    title: string;
    description: string | null;
  };
}

export interface CreatedCourse {
  course_id: number;
  title: string;
  description: string;
  student_count: number;
}

export interface UserSchema {
  email: string;
  user_id: string;
  display_name: string;
  profile_url: string | null;
  createdAt: Date;
  is_course_creator: boolean;
  created_courses: CreatedCourse[];
  purchased_courses: PurchasedCourse[];
}
