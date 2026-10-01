import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Shield, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Calendar, 
  Mail, 
  Trash2,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { usersService, type UserAdmin } from '@/services/users.service';
import { authService } from '@/services/auth.service';
import { getInitials } from '@/utils';

export function UsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MENTOR'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data.results || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: UserAdmin) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    setActionLoading(user.id);
    try {
      await usersService.update(user.id, { is_active: !user.is_active });
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: UserAdmin) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your own administrative account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${user.username} (${user.email})?`)) {
      return;
    }
    setActionLoading(user.id);
    try {
      await usersService.delete(user.id);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalMentors = users.filter((u) => u.role === 'MENTOR').length;
  const totalCertificatesIssued = users.reduce((sum, u) => sum + (u.certificates_count || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>User Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              User Directory & Activity Ledger
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Inspect all registered administrators and mentors, monitor issuance quotas, verify access permissions, and manage account statuses.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchUsers} 
            disabled={loading}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </Button>
        </div>
      </div>

      {/* STAT SUMMARY CARDS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{loading ? '...' : users.length}</span>
              <span className="text-xs font-medium text-slate-500">accounts</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Platform members with access</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Mentors</span>
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-violet-700">{loading ? '...' : totalMentors}</span>
              <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">MENTORS</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Authorized credential issuers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrators</span>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-700">{loading ? '...' : totalAdmins}</span>
              <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200">ADMINS</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Full governance privileges</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certificates Issued</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">{loading ? '...' : totalCertificatesIssued}</span>
              <span className="text-xs font-semibold text-emerald-600">Total generated</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Issued across all user accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, username, or email..."
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={roleFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ALL')}
              className="text-xs font-semibold"
            >
              All ({users.length})
            </Button>
            <Button
              variant={roleFilter === 'ADMIN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ADMIN')}
              className="text-xs font-semibold"
            >
              Admins ({totalAdmins})
            </Button>
            <Button
              variant={roleFilter === 'MENTOR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('MENTOR')}
              className="text-xs font-semibold"
            >
              Mentors ({totalMentors})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* USERS TABLE */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">User Records</CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredUsers.length} of {users.length} registered accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-medium">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
              Loading user accounts...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700">No users found</p>
              <p className="text-xs text-slate-400 mt-1">Try modifying your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">User / Identity</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Certificates Issued</th>
                    <th className="py-3.5 px-4">Date Joined</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
                    const isSelf = user.id === currentUser?.id;
                    const dateJoined = user.date_joined 
                      ? new Date(user.date_joined).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '—';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                              <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold text-xs">
                                {getInitials(fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {fullName}
                                {isSelf && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-slate-600">@{user.username}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {user.role === 'ADMIN' ? (
                            <Badge className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 font-semibold gap-1 text-xs">
                              <Shield className="w-3 h-3" />
                              ADMIN
                            </Badge>
                          ) : (
                            <Badge className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 font-semibold gap-1 text-xs">
                              <GraduationCap className="w-3 h-3" />
                              MENTOR
                            </Badge>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-xs text-slate-800">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            {user.certificates_count ?? 0}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {dateJoined}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSelf || actionLoading === user.id}
                              onClick={() => handleToggleActive(user)}
                              className={`h-8 text-xs font-semibold ${
                                user.is_active 
                                  ? 'text-amber-700 hover:bg-amber-50 border-amber-200' 
                                  : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSelf || actionLoading === user.id}
                              onClick={() => handleDeleteUser(user)}
                              className="h-8 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
