import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  LayoutDashboard,
  Award,
  FileCheck2,
  Palette,
  FolderTree,
  Users,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
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
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'MENTOR'] },
  { icon: Award, label: 'Certificates', path: '/certificates', roles: ['ADMIN', 'MENTOR'] },
  { icon: Palette, label: 'Templates', path: '/templates', roles: ['ADMIN', 'MENTOR'], mentorLabel: 'Templates (View Only)' },
  { icon: FolderTree, label: 'Categories', path: '/categories', roles: ['ADMIN'] },
  { icon: Users, label: 'Users', path: '/users', roles: ['ADMIN'] },
  { icon: FileCheck2, label: 'Verify Portal', path: '/verify', roles: ['ADMIN', 'MENTOR'] },
  { icon: UserCheck, label: 'Profile', path: '/profile', roles: ['ADMIN', 'MENTOR'] },
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

  const userRole = currentUser?.role || 'MENTOR';

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-950 text-slate-300 border-r border-slate-800/80 transition-all duration-300 relative z-30 shadow-xl',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/25 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                CertiGen
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                  userRole === 'ADMIN' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' 
                    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                }`}>
                  {userRole}
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Digital Credentials</span>
            </div>
          )}
        </Link>

        {/* Collapse Button */}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {isOpen && (
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {userRole === 'ADMIN' ? 'Admin Portal' : 'Mentor Workspace'}
            </p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {userRole}
            </span>
          </div>
        )}

        {sidebarItems.map((item) => {
          const hasAccess = item.roles.includes(userRole);
          if (!hasAccess) return null;

          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const displayLabel = (userRole === 'MENTOR' && item.mentorLabel) ? item.mentorLabel : item.label;

          return (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  'flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
                title={!isOpen ? displayLabel : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  )}
                />
                {isOpen && <span className="ml-3 truncate">{displayLabel}</span>}

                {/* Active Pill Indicator */}
                {isActive && (
                  <span className="absolute right-2 w-1.5 h-4 bg-white/40 rounded-full" />
                )}
              </div>
            </Link>
          );
        })}


        {/* Extra Quick Action in Sidebar */}
        {isOpen && (
          <div className="pt-4 mt-4 border-t border-slate-850">
            <Link to="/certificates/create">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-sky-500/40 transition-all group">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Generation
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Issue tamper-proof certificates with embedded QR in seconds.
                </p>
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      {currentUser && (
        <div className="border-t border-slate-850 p-3 bg-slate-950/60">
          <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-900 transition-colors">
            <div className="relative">
              <Avatar className="h-9 w-9 border-2 border-sky-500/40">
                <AvatarFallback className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white font-bold text-xs">
                  {getInitials(`${currentUser.first_name || 'Admin'} ${currentUser.last_name || 'User'}`)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            {isOpen ? (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {currentUser.email}
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentUser.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            ) : null}

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
