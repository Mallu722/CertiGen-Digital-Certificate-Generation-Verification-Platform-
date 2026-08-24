import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { certificatesService } from '@/services/certificates.service';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

const verifySchema = z.object({
  certificate_id: z.string().min(1, 'Certificate ID is required'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export function VerifyPage() {
  const { certificate_id } = useParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    certificate: any;
    valid: boolean;
    verified_at: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      certificate_id: certificate_id || '',
    },
  });

  const onSubmit = async (data: VerifyFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await certificatesService.verify(data.certificate_id);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificate_id) {
      onSubmit({ certificate_id });
    }
  }, [certificate_id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verify Certificate</h2>
        <p className="text-slate-500">Validate the authenticity of a certificate</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Certificate ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Controller
                name="certificate_id"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter certificate ID or number"
                    className="pl-10 text-lg py-3"
                  />
                )}
              />
            </div>

            <Button type="submit" className="w-full py-3" isLoading={loading} disabled={loading}>
              Verify Certificate
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div className={`p-4 rounded-lg flex items-start gap-3 mb-6 ${
                result.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
              }`}>
                {result.valid ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${
                    result.valid ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {result.valid ? 'Certificate is Valid' : 'Certificate is Invalid'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Verified at: {formatDate(result.verified_at)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Certificate ID</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {result.certificate.certificate_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Title</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {result.certificate.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Recipient</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {result.certificate.recipient_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Date Issued</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {formatDate(result.certificate.issued_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Description</p>
                        <p className="text-sm text-slate-900 mt-1">
                          {result.certificate.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Verification Status</p>
                        <Badge variant={result.valid ? 'success' : 'destructive'} className="mt-1">
                          {result.valid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
