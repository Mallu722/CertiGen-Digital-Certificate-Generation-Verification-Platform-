import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { certificatesService } from '@/services/certificates.service';
import type { Certificate } from '@/types';

export function CertificatesListPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Revocation Modal State
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificatesService.getAll({ page, search });
      setCertificates(response.results || []);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCertificates();
  };

  const handleDownloadPdf = async (certificate: Certificate) => {
    try {
      setDownloadingId(certificate.id);
      await certificatesService.downloadPdf(certificate.id, `${certificate.certificate_number}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Could not download certificate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokingCert) return;
    try {
      setActionLoading(true);
      await certificatesService.revoke(revokingCert.id, revocationReason || 'Revoked by administrator');
      setRevokingCert(null);
      setRevocationReason('');
      await fetchCertificates();
    } catch (error) {
      console.error('Failed to revoke:', error);
      alert('Failed to revoke certificate.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (certificate: Certificate) => {
    if (!window.confirm(`Are you sure you want to reactivate ${certificate.certificate_number}?`)) return;
    try {
      setActionLoading(true);
      await certificatesService.reactivate(certificate.id);
      await fetchCertificates();
    } catch (error) {
      console.error('Failed to reactivate:', error);
      alert('Failed to reactivate certificate.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
          <p className="text-slate-500">Generate, download, verify and manage certificate lifecycles</p>
        </div>
        <Link to="/certificates/create">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Issue Certificate
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search certificate ID, recipient..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead className="font-semibold">Certificate ID</TableHead>
                    <TableHead className="font-semibold">Title / Event</TableHead>
                    <TableHead className="font-semibold">Recipient</TableHead>
                    <TableHead className="font-semibold">Date Issued</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        No certificates found. Issue a new one to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificates.map((certificate) => {
                      const isRevoked = certificate.status === 'REVOKED';
                      return (
                        <TableRow key={certificate.id} className={isRevoked ? 'bg-red-50/30' : undefined}>
                          <TableCell className="font-mono font-medium text-slate-900">
                            {certificate.certificate_number}
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">{certificate.title}</TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium text-slate-900 block">{certificate.recipient_name}</span>
                              <span className="text-xs text-slate-400">{certificate.recipient_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{formatDate(certificate.issued_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {isRevoked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  REVOKED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  VALID
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Download PDF Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-slate-700 hover:text-sky-700 hover:border-sky-300"
                                onClick={() => handleDownloadPdf(certificate)}
                                disabled={downloadingId === certificate.id}
                                title="Download Certificate PDF"
                              >
                                {downloadingId === certificate.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5 mr-1 text-slate-500" />
                                )}
                                PDF
                              </Button>

                              {/* Public Verify Link */}
                              <a
                                href={`/verify/${certificate.certificate_number}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-slate-700 hover:text-indigo-700"
                                  title="Open Public Verification Link"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>

                              {/* Revoke / Reactivate Button */}
                              {isRevoked ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  onClick={() => handleReactivate(certificate)}
                                  disabled={actionLoading}
                                  title="Reactivate Certificate"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => setRevokingCert(certificate)}
                                  disabled={actionLoading}
                                  title="Revoke Certificate"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-xs text-slate-500">
              Showing {certificates.length} certificates
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={certificates.length < 10}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revocation Confirmation Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2.5 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revoke Certificate</h3>
                <p className="text-xs text-slate-500 font-mono">{revokingCert.certificate_number}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to revoke this certificate for <strong className="text-slate-900">{revokingCert.recipient_name}</strong>?
              Anyone who scans the QR code or verifies this certificate will be alerted that it is <strong>REVOKED</strong>.
            </p>

            <div className="space-y-1.5 mb-6">
              <label className="text-xs font-semibold text-slate-700">Reason for Revocation</label>
              <Input
                placeholder="e.g. Plagiarism, administrative cancellation, expired"
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => {
                  setRevokingCert(null);
                  setRevocationReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevokeConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? 'Revoking...' : 'Confirm Revocation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
