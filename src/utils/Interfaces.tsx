export interface PurchasedCourse {
  course: {
    course_id: string;
    title: string;
    description: string | null;
    thumbnail: string;
  };
}

export interface CreatedCourse {
  course_id: number;
  title: string;
  description: string;
  student_count: number;
  thumbnail: string;
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

export interface CourseSchema {
  course_id: string;
  title: string;
  description: string;
  image_url: string;
  creator_name: string;
  creator_avatar?: string;
  thumbnail: string;
}

export interface Video {
  video_id: string;
  title: string;
  filename: string;
  created_at: string;
  size: number;
  url?: string | null;
}

export interface CourseData {
  course_id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  video_count: number;
  student_count: number;
  thumbnail: string;
  videos: Video[];
  creator: {
    display_name: string;
    profile_url: string;
    email: string;
  };
}
