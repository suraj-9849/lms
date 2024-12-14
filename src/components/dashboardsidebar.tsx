import Link from 'next/link';
import { Home, BookOpen, Users, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="flex w-64 flex-col bg-gray-800">
      <div className="flex h-20 items-center justify-center shadow-md">
        <h1 className="text-3xl uppercase text-indigo-500">LMS</h1>
      </div>
      <ul className="flex flex-col py-4">
        <li>
          <Link
            href="/dashboard"
            className="flex h-12 transform flex-row items-center text-gray-500 transition-transform duration-200 ease-in hover:translate-x-2 hover:text-gray-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/courses"
            className="flex h-12 transform flex-row items-center text-gray-500 transition-transform duration-200 ease-in hover:translate-x-2 hover:text-gray-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Courses</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/students"
            className="flex h-12 transform flex-row items-center text-gray-500 transition-transform duration-200 ease-in hover:translate-x-2 hover:text-gray-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
              <Users className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Students</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/settings"
            className="flex h-12 transform flex-row items-center text-gray-500 transition-transform duration-200 ease-in hover:translate-x-2 hover:text-gray-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
              <Settings className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
