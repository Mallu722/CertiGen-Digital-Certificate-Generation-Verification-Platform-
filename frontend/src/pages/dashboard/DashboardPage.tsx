import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  FileCheck2, 
  Palette, 
  FolderTree, 
  Plus, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  QrCode,
  GraduationCap,
  Shield,
  Lock,
  Info
} from 'lucide-react';
import { certificatesService } from '@/services/certificates.service';
import { templatesService } from '@/services/templates.service';
import { categoriesService } from '@/services/categories.service';
import { authService } from '@/services/auth.service';
import type { Certificate, User as UserType } from '@/types';

interface Stats {
  totalCertificates: number;
  totalTemplates: number;
  totalCategories: number;
  validCertificates: number;
  myCertificatesCount: number;
}

export function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalCertificates: 0,
    totalTemplates: 0,
    totalCategories: 0,
    validCertificates: 0,
    myCertificatesCount: 0,
  });
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [nextId, setNextId] = useState<string>('CERT-2026-000001');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchDashboardData(user);
  }, []);

  const fetchDashboardData = async (user: UserType | null) => {
    try {
      setLoading(true);
      const [certRes, tplRes, catRes, nextIdRes] = await Promise.allSettled([
        certificatesService.getAll({ page: 1 }),
        templatesService.getAll(),
        categoriesService.getAll(),
        certificatesService.getNextNumber()
      ]);

      const certs = certRes.status === 'fulfilled' ? certRes.value.results || [] : [];
      const templates = tplRes.status === 'fulfilled' ? tplRes.value.results || [] : [];
      const categories = catRes.status === 'fulfilled' ? catRes.value.results || [] : [];
      const nextNum = nextIdRes.status === 'fulfilled' ? nextIdRes.value.next_number : 'CERT-2026-000001';

      const validCount = certs.filter(c => c.status === 'VALID').length;
      
      // Filter for mentor: certificates issued by this user
      const myCerts = user?.id 
        ? certs.filter(c => c.issued_by === user.id) 
        : certs;

      setStats({
        totalCertificates: certs.length,
        totalTemplates: templates.length,
        totalCategories: categories.length,
        validCertificates: validCount,
        myCertificatesCount: myCerts.length > 0 ? myCerts.length : certs.length,
      });

      setRecentCertificates(user?.role === 'MENTOR' && myCerts.length > 0 ? myCerts.slice(0, 5) : certs.slice(0, 5));
      setNextId(nextNum);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert: Certificate) => {
    try {
      await certificatesService.downloadPdf(cert.id, `${cert.certificate_number}.pdf`);
    } catch (err) {
      alert('Could not download PDF.');
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 1. ROLE-SPECIFIC HERO BANNER */}
      {isAdmin ? (
        /* ADMINISTRATOR HERO */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 -mb-16 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Shield className="w-3.5 h-3.5" />
                <span>Administrator Control Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Platform Administration & Ledger Governance
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Full administrative authority: configure certificate templates, manage categories, oversee mentor issuances, and audit revocation records.
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Role: Administrator
                </span>
                <span>•</span>
                <span>Next Serial: <strong className="text-sky-400">{nextId}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <Link to="/certificates/create">
                <Button size="lg" className="shadow-lg shadow-sky-500/30 font-bold gap-2">
                  <Plus className="w-5 h-5" />
                  Issue Certificate
                </Button>
              </Link>
              <Link to="/templates">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold gap-2">
                  <Palette className="w-5 h-5 text-sky-300" />
                  Manage Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* MENTOR / ISSUER HERO */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-900/60">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 -mb-16 w-60 h-60 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <GraduationCap className="w-4 h-4" />
                <span>Mentor Credential Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Issue Verified Certificates to Students
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Welcome, {currentUser?.first_name || 'Mentor'}! Issue verifiable credentials for hackathons, workshops, and courses with instantaneous QR code validation.
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Role: Mentor / Issuer
                </span>
                <span>•</span>
                <span>Template Customization: <span className="text-amber-400 font-semibold">Admin Managed</span></span>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <Link to="/certificates/create">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 font-bold gap-2">
                  <Plus className="w-5 h-5" />
                  Issue Certificate
                </Button>
              </Link>
              <Link to="/verify" target="_blank">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold gap-2">
                  <QrCode className="w-5 h-5 text-indigo-300" />
                  Verify Credential
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MENTOR ACCESS BANNER */}
      {!isAdmin && (
        <div className="p-4 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-start gap-3.5 text-indigo-950 text-xs shadow-xs">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block text-sm text-indigo-900 mb-0.5">Mentor Role Scope:</span>
            <span>
              You have authorization to generate, sign, and issue certificates using existing approved templates. 
              <strong> Template editing and deletion are restricted to Administrators</strong> to ensure organizational compliance and uniform branding.
            </span>
          </div>
        </div>
      )}

      {/* 2. STAT CARDS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Total Ledger Issued' : 'My Issued Certificates'}
              </span>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {loading ? '...' : (isAdmin ? stats.totalCertificates : stats.myCertificatesCount)}
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +100%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Total records in digital ledger' : 'Certificates issued by you'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valid Credentials</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">{loading ? '...' : stats.validCertificates}</span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">VALID</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Active & cryptographically valid</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Custom Templates' : 'Approved Templates'}
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Palette className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{loading ? '...' : stats.totalTemplates}</span>
              {!isAdmin && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">View-Only</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Full edit & upload access' : 'Ready for certificate issuance'}
            </p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Categories & Roles' : 'Award Categories'}
              </span>
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                {isAdmin ? <Users className="h-5 w-5" /> : <FolderTree className="h-5 w-5" />}
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{loading ? '...' : stats.totalCategories}</span>
              <span className="text-xs text-slate-400 font-medium">domains</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Manageable categories' : 'Available topics'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Action Tiles (2 cols) */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-900">
              {isAdmin ? 'Administrative Actions' : 'Mentor Quick Actions'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isAdmin ? 'Manage platform configuration' : 'Issue and review credentials'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Action 1 */}
              <Link to="/certificates/create" className="group">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center mb-3 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                      Issue Certificate
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PDF + unique QR code
                    </p>
                  </div>
                </div>
              </Link>

              {/* Action 2 */}
              <Link to="/verify" target="_blank" className="group">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Verify Credential
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify serial or scan QR
                    </p>
                  </div>
                </div>
              </Link>

              {/* Action 3 */}
              <Link to="/templates" className="group">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Templates
                      </h3>
                      {!isAdmin && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded">View Only</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAdmin ? 'Create & edit layouts' : 'Browse active designs'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Action 4 */}
              <Link to="/certificates" className="group">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-400 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors">
                      {isAdmin ? 'Audit & Revoke' : 'My Certificates'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAdmin ? 'Audit records & revoke' : 'Download issued PDFs'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Certificates (3 cols) */}
        <Card className="lg:col-span-3 border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                {isAdmin ? 'Platform Certificate Activity' : 'Recent Issued Certificates'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isAdmin ? 'Live ledger feed across all issuers' : 'Credentials signed and issued'}
              </CardDescription>
            </div>
            <Link to="/certificates">
              <Button variant="ghost" size="sm" className="text-xs text-sky-600 hover:text-sky-700 font-semibold gap-1">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCertificates.length === 0 ? (
              <div className="text-center py-10 border rounded-2xl border-dashed border-slate-200">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No certificates recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Issue a new credential to see it listed here.</p>
                <Link to="/certificates/create" className="inline-block mt-3">
                  <Button size="sm">Issue Now</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCertificates.map((cert) => {
                  const isRevoked = cert.status === 'REVOKED';
                  return (
                    <div key={cert.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isRevoked ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'
                        }`}>
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {cert.certificate_number}
                            </span>
                            {isRevoked ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600" />
                                REVOKED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                VALID
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {cert.recipient_name} • {cert.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold text-slate-700 hover:text-sky-700"
                          onClick={() => handleDownload(cert)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          PDF
                        </Button>
                        <a
                          href={`/verify/${cert.certificate_number}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
