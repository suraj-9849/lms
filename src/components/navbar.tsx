import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href={'/dashboard'} className="flex flex-shrink-0 items-center">
              <span className="text-2xl font-bold text-gray-800">LMS</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}