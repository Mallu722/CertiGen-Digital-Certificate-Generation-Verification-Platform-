import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { authService } from '@/services/auth.service';
import { AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      await authService.register({
        email: data.email,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const firstError = Object.values(errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
          setError(String(errors));
        }
      } else {
        setError('Registration failed. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="first_name">First Name</FormLabel>
            <Controller
              name="first_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input id="first_name" placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="last_name">Last Name</FormLabel>
            <Controller
              name="last_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input id="last_name" placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="username">Username</FormLabel>
          <Controller
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="username" placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="email">Email</FormLabel>
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="email" type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="password">Password</FormLabel>
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="password" type="password" placeholder="At least 8 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="password_confirm">Confirm Password</FormLabel>
          <Controller
            name="password_confirm"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="password_confirm" type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full mt-6" isLoading={loading} disabled={loading}>
          Create Account
        </Button>
      </form>
    </div>
  );
}
