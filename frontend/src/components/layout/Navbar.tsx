import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { Button } from '../ui/button';
import { Bell, Search, Menu, User } from 'lucide-react';

interface NavbarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
  title?: string;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export function Navbar({ isOpen = true, toggleSidebar, title, user }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Left side - Menu toggle and title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-900 hidden md:block">
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Right side - Search and user profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden border border-sky-200">
              <User className="h-4 w-4 text-sky-600" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
