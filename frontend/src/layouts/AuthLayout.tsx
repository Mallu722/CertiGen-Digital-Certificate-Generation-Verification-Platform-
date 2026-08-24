import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/20">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center">CertiGen</h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Digital Certificate Generation & Verification Platform
          </p>
        </div>
      </div>

      {/* Right side - Login / Register Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
