import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Bell, Search, Menu, Plus, ShieldCheck, Sparkles } from 'lucide-react';

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

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Platform Dashboard', subtitle: 'Overview & Analytics' },
  '/certificates': { title: 'Certificates Management', subtitle: 'Issue, view, and revoke credentials' },
  '/certificates/create': { title: 'Issue Digital Certificate', subtitle: 'Generate PDF & secure verification QR' },
  '/templates': { title: 'Certificate Templates', subtitle: 'Design layouts and background styles' },
  '/categories': { title: 'Categories', subtitle: 'Organize certificates and event types' },
  '/profile': { title: 'Admin Profile', subtitle: 'Account settings and security' },
};

export function Navbar({ toggleSidebar, title, user }: NavbarProps) {
  const location = useLocation();
  const currentMeta = pageTitles[location.pathname] || {
    title: title || 'CertiGen Platform',
    subtitle: 'Credential Management'
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 z-20 sticky top-0 shadow-xs">
      {/* Left side - Menu toggle and title */}
      <div className="flex items-center gap-3.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleSidebar}
          className="h-9 w-9 text-slate-700 hover:text-slate-900 border-slate-200"
          title="Toggle Navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right side - Quick Action + Search + Verify + Notifications */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search credentials..."
            className="pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-56 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Public Verify Portal Link */}
        <Link to="/verify" target="_blank">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex text-xs font-semibold text-sky-700 bg-sky-50/60 border-sky-200 hover:bg-sky-100 hover:text-sky-800"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-600" />
            Public Verification
          </Button>
        </Link>

        {/* Quick Issue Button */}
        {location.pathname !== '/certificates/create' && (
          <Link to="/certificates/create">
            <Button size="sm" className="text-xs font-bold shadow-sm shadow-sky-600/25">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Issue New
            </Button>
          </Link>
        )}

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon-sm"
          className="relative h-9 w-9 text-slate-600 border-slate-200 hover:text-slate-900"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-sky-600 rounded-full ring-2 ring-white" />
        </Button>
      </div>
    </header>
  );
}
