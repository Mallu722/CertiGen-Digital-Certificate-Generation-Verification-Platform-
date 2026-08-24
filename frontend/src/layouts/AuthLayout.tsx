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

      {/* Right side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          <Outlet />

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 font-medium hover:text-sky-700">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-slate-100 rounded-lg">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Demo Credentials:</h3>
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Admin:</strong> admin@example.com / password</p>
              <p><strong>Mentor:</strong> mentor@example.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
