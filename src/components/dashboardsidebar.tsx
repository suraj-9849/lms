import Link from 'next/link';
import { Home, BookOpen, Users, Settings, Plus } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="flex w-64 flex-col bg-gray-900">
      <div className="ml-2 inline-flex h-20 items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#fff"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">LMS</span>
        </div>
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
            <span className="text-sm font-medium">Home</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/published-courses"
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
            href="/dashboard/create-course"
            className="flex h-12 transform flex-row items-center text-gray-500 transition-transform duration-200 ease-in hover:translate-x-2 hover:text-gray-200"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Create</span>
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
