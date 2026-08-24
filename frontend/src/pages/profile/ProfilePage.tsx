import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, getAvatarColor } from '@/utils';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const user = authService.getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      await authService.updateProfile({
        ...user!,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = getInitials(`${user.first_name} ${user.last_name}`);
  const avatarColor = getAvatarColor(`${user.first_name} ${user.last_name}`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-slate-500">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-8">
            <div className={`h-20 w-20 rounded-full ${avatarColor} flex items-center justify-center shrink-0`}>
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{user.first_name} {user.last_name}</h3>
              <p className="text-slate-500">{user.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-emerald-800">Profile Updated</h3>
                <p className="text-sm text-emerald-600 mt-1">Your profile has been successfully updated.</p>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">First Name</label>
                <Controller
                  name="first_name"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Last Name</label>
                <Controller
                  name="last_name"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Email</label>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} type="email" />
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" isLoading={loading} disabled={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div>
                <h3 className="font-medium text-slate-900">Change Password</h3>
                <p className="text-sm text-slate-500">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium text-slate-900">Session Security</h3>
                <p className="text-sm text-slate-500">Manage active sessions</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
