import {
  Loader2,
  LightbulbIcon as LucideProps,
  Moon,
  SunMedium,
  Twitter,
  User,
  Github,
} from 'lucide-react';

export type Icon = typeof LucideProps;

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  twitter: Twitter,
  gitHub: Github,
  user: User,
  spinner: Loader2,
};
