'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, BookOpen, Users, Settings, Plus, Menu, X } from 'lucide-react';

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/published-courses', icon: BookOpen, label: 'Published Courses' },
  { href: '/dashboard/create-course', icon: Plus, label: 'Create' },
  { href: '/dashboard/purchased-courses', icon: Users, label: 'Purchased Courses' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed left-2 top-4 z-20 rounded-md bg-gray-900 p-2 text-white"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <X className="relative h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-10 w-64 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative w-64'
        } flex flex-col bg-gray-900`}
      >
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
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-12 transform flex-row items-center text-gray-500 transition-transform duration-200 ease-in hover:translate-x-2 hover:text-gray-200"
                onClick={() => isMobile && setIsOpen(false)}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center text-lg text-gray-400">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
