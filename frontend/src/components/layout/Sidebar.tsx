import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Home,
  FileText,
  Settings,
  Users,
  FileCode,
  FileCheck,
  CreditCard,
  LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { getInitials } from '@/utils';

interface SidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'MENTOR'] },
  { icon: FileText, label: 'Certificates', path: '/certificates', roles: ['ADMIN', 'MENTOR'] },
  { icon: FileCheck, label: 'Verify Certificate', path: '/verify', roles: ['ADMIN', 'MENTOR'] },
  { icon: FileCode, label: 'Templates', path: '/templates', roles: ['ADMIN', 'MENTOR'] },
  { icon: CreditCard, label: 'Categories', path: '/categories', roles: ['ADMIN', 'MENTOR'] },
  { icon: Users, label: 'Users', path: '/users', roles: ['ADMIN'] },
  { icon: Settings, label: 'Profile', path: '/profile', roles: ['ADMIN', 'MENTOR'] },
];

export function Sidebar({
  isOpen = true,
  toggleSidebar,
  onLogout
}: SidebarProps) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const authenticatedUser = authService.getCurrentUser();
    if (authenticatedUser) {
      setCurrentUser(authenticatedUser);
    }
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {isOpen && (
            <span className="font-bold text-xl text-slate-900">CertiGen</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            // Check if user has access to this item based on role
            const hasAccess = item.roles.includes('ADMIN') || item.roles.includes('MENTOR');
            
            if (!hasAccess) return null;

            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start mb-1',
                    !isOpen && 'flex-col py-4 h-auto'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', !isOpen && 'mb-1')} />
                  {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      {currentUser && (
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(`${currentUser.first_name} ${currentUser.last_name}`)}</AvatarFallback>
            </Avatar>
            {isOpen ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
            ) : (
              <div className="flex-1 text-center">
                <p className="text-xs font-medium text-slate-900">
                  {currentUser.first_name?.charAt(0)}
                </p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
