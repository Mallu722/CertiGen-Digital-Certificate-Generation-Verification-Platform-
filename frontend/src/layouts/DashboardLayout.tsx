import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { authService } from '@/services/auth.service';

interface DashboardLayoutProps {
  title?: string;
}

export function DashboardLayout({ title }: DashboardLayoutProps = {}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.refreshToken(refreshToken);
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      handleLogout();
    }
  };

  // Check token expiry every minute
  useEffect(() => {
    const checkTokenExpiry = setInterval(() => {
      const token = authService.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000;
          const now = Date.now();
          
          // Refresh token 5 minutes before expiry
          if (expiry - now < 5 * 60 * 1000) {
            refreshToken();
          }
        } catch (error) {
          console.error('Failed to check token expiry:', error);
        }
      }
    }, 60000);

    return () => clearInterval(checkTokenExpiry);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          isOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
