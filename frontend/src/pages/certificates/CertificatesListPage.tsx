import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Plus, Eye } from 'lucide-react';
import { certificatesService } from '@/services/certificates.service';
import type { Certificate } from '@/types';

export function CertificatesListPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const fetchCertificates = async () => {
    try {
      const response = await certificatesService.getAll({ page, search });
      setCertificates(response.results);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
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
          <p className="text-slate-500">Manage and issue certificates</p>
        </div>
        <Link to="/certificates/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Issue Certificate
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search certificates..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No certificates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.certificate_number}
                        </TableCell>
                        <TableCell>{certificate.title}</TableCell>
                        <TableCell>{certificate.recipient_name}</TableCell>
                        <TableCell>{formatDate(certificate.issued_at)}</TableCell>
                        <TableCell>
                          <Badge variant={certificate.verified ? 'success' : 'warning'}>
                            {certificate.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/certificates/${certificate.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              Showing {certificates.length} of unknown total results
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
    </div>
  );
}
