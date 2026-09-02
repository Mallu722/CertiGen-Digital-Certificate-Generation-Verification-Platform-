import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { authService } from '@/services/auth.service';
import type { Role } from '@/types';
import { 
  AlertCircle, 
  LogIn, 
  KeyRound, 
  ShieldCheck, 
  GraduationCap, 
  Check, 
  ArrowRight,
  User,
  X,
  Sparkles
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GithubIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // OAuth Modals State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGithubUser, setCustomGithubUser] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({
        email: data.email,
        password: data.password,
        role: selectedRole,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setError(null);
  };


  // Google OAuth Login Action
  const handleGoogleAccountSelect = async (accountEmail: string, name?: string) => {
    setLoading(true);
    setError(null);
    setShowGoogleModal(false);
    try {
      await authService.oauthLogin({
        email: accountEmail,
        provider: 'google',
        role: selectedRole,
        first_name: name || 'Google User',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  // GitHub OAuth Login Action
  const handleGithubAccountSelect = async (username: string) => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setShowGithubModal(false);
    try {
      const email = username.includes('@') ? username : `${username.toLowerCase()}@github.com`;
      await authService.oauthLogin({
        email: email,
        provider: 'github',
        role: selectedRole,
        first_name: username,
        username: username,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'GitHub login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <LogIn className="w-7 h-7 text-sky-600" />
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500 mt-1">Select your portal role and sign in</p>
      </div>

      {/* 1. ROLE SELECTOR: ADMIN vs MENTOR */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
          Select Your Portal Role:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Admin Role Card */}
          <div
            onClick={() => handleSelectRole('ADMIN')}
            className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              selectedRole === 'ADMIN'
                ? 'border-sky-600 bg-sky-50/50 shadow-sm ring-2 ring-sky-100'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${selectedRole === 'ADMIN' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              {selectedRole === 'ADMIN' && (
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Administrator</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Full platform audit, templates & revocation
              </p>
            </div>
          </div>

          {/* Mentor Role Card */}
          <div
            onClick={() => handleSelectRole('MENTOR')}
            className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              selectedRole === 'MENTOR'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-100'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${selectedRole === 'MENTOR' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              {selectedRole === 'MENTOR' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Mentor / Issuer</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Issue certificates, student ledger & verification
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Authentication Error</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 2. CREDENTIALS FORM */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <FormLabel htmlFor="email">
            Email Address ({selectedRole === 'ADMIN' ? 'Administrator' : 'Mentor'})
          </FormLabel>
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="email" type="email" placeholder="e.g. name@company.com" {...field} />
                </FormControl>
                {form.formState.errors.email && (
                  <FormMessage>{form.formState.errors.email.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password">Password</FormLabel>
            <a href="#" className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors">
              Forgot password?
            </a>
          </div>
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="password" type="password" placeholder="••••••••" {...field} />
                </FormControl>
                {form.formState.errors.password && (
                  <FormMessage>{form.formState.errors.password.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className={`w-full h-11 text-base font-bold shadow-md ${
            selectedRole === 'ADMIN' 
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 shadow-sky-600/25' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-600/25'
          }`} 
          isLoading={loading} 
          disabled={loading}
        >
          Sign In as {selectedRole === 'ADMIN' ? 'Administrator' : 'Mentor'}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* 3. SOCIAL LOGINS (GOOGLE & GITHUB) */}
      <div className="space-y-4 pt-1">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider">
              Or sign in with OAuth
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => setShowGoogleModal(true)} 
            disabled={loading}
            className="h-10 border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
          >
            <GoogleIcon />
            Google
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => setShowGithubModal(true)} 
            disabled={loading}
            className="h-10 border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
          >
            <GithubIcon />
            GitHub
          </Button>
        </div>
      </div>

      <div className="text-center pt-1">
        <p className="text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-600 font-semibold hover:text-sky-700 hover:underline transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <span className="font-bold text-sm text-slate-900">Sign in with Google</span>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Choose an account</p>
                <p className="text-xs text-slate-500">
                  to continue to <strong>CertiGen</strong> as{' '}
                  <span className="font-bold text-sky-600">
                    {selectedRole === 'ADMIN' ? 'Administrator' : 'Mentor / Issuer'}
                  </span>
                </p>
              </div>

              {/* Connected Google Accounts List */}
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                {/* Account 1 */}
                <button
                  type="button"
                  onClick={() => handleGoogleAccountSelect('mallikarjunhiremath0722@gmail.com', 'Mallikarjun Hiremath')}
                  className="w-full flex items-center gap-3.5 p-3 hover:bg-white hover:shadow-xs transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    M
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        Mallikarjun Hiremath
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                      mallikarjunhiremath0722@gmail.com
                    </p>
                  </div>
                </button>

                {/* Account 2 */}
                <button
                  type="button"
                  onClick={() => handleGoogleAccountSelect('mh2429419@gmail.com', 'MH Mentor')}
                  className="w-full flex items-center gap-3.5 p-3 hover:bg-white hover:shadow-xs transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    MH
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        MH Mentor Account
                      </p>
                      <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
                        Google Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                      mh2429419@gmail.com
                    </p>
                  </div>
                </button>
              </div>

              {/* Option to use another Google account */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Or sign in with another Google email:
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold"
                    onClick={() => handleGoogleAccountSelect(customGoogleEmail)}
                    disabled={!customGoogleEmail.includes('@')}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GITHUB ACCOUNT CHOOSER MODAL */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GithubIcon />
                <span className="font-bold text-sm text-slate-900">Authorize CertiGen via GitHub</span>
              </div>
              <button 
                onClick={() => setShowGithubModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Connected GitHub Account</p>
                <p className="text-xs text-slate-500">
                  Authorize your GitHub account to sign in as{' '}
                  <span className="font-bold text-indigo-600">
                    {selectedRole === 'ADMIN' ? 'Administrator' : 'Mentor / Issuer'}
                  </span>
                </p>
              </div>

              {/* Primary Connected GitHub Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://github.com/Mallu722.png" 
                    alt="GitHub Profile" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-11 h-11 rounded-full border-2 border-white shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">Mallu722</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      mallikarjunhiremath0722@gmail.com
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full h-10 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                  onClick={() => handleGithubAccountSelect('Mallu722')}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Authorize as Mallu722 (Connected Email)
                </Button>
              </div>

              {/* Or enter another GitHub username */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Or use another GitHub username / email:
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. your-github-user"
                    value={customGithubUser}
                    onChange={(e) => setCustomGithubUser(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold"
                    onClick={() => handleGithubAccountSelect(customGithubUser)}
                    disabled={!customGithubUser.trim()}
                  >
                    Authorize
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
