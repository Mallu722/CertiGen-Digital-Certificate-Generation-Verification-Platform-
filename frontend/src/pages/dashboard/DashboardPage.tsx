import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, FileText, FileCheck, Users } from 'lucide-react';

interface Stats {
  totalCertificates: number;
  totalTemplates: number;
  totalCategories: number;
  totalUsers: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalCertificates: 0,
    totalTemplates: 0,
    totalCategories: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, using mock data
    setStats({
      totalCertificates: 156,
      totalTemplates: 12,
      totalCategories: 5,
      totalUsers: 24,
    });
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, description, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : value}</div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-slate-500">Overview of your CertiGen platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Certificates"
          value={stats.totalCertificates}
          icon={FileText}
          description="Certificates issued"
          color="bg-sky-100 text-sky-600"
        />
        <StatCard
          title="Templates"
          value={stats.totalTemplates}
          icon={FileCheck}
          description="Certificate templates"
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={User}
          description="Certificate categories"
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Users"
          value={stats.totalUsers}
          icon={Users}
          description="Platform users"
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/certificates/create">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  <span className="font-medium">Issue Certificate</span>
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <FileCheck className="h-8 w-8" />
                  <span className="font-medium">Manage Templates</span>
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <User className="h-8 w-8" />
                  <span className="font-medium">Categories</span>
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <FileCheck className="h-8 w-8" />
                  <span className="font-medium">Verify Certificate</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest certificate issuances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      Certificate #{1000 + i} issued
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {i === 1 ? 'John Doe - Development Fundamentals' : 'Certificate issued for completed training'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {formatDate(new Date().toISOString())}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm">
              View all activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
