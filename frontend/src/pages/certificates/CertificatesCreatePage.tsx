import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoriesService } from '@/services/categories.service';
import { templatesService } from '@/services/templates.service';
import { certificatesService } from '@/services/certificates.service';
import { AlertCircle } from 'lucide-react';
import type { Category, Template } from '@/types';

const certificateSchema = z.object({
  certificate_number: z.string().min(1, 'Certificate number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  template: z.number().min(1, 'Template is required'),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_email: z.string().email('Invalid email address'),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export function CertificatesCreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Initialize form
  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificate_number: '',
      title: '',
      description: '',
      template: undefined,
      recipient_name: '',
      recipient_email: '',
    },
  });

  // Load categories and templates
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoriesResponse = await categoriesService.getAll();
        setCategories(categoriesResponse.results || []);
        
        const templatesResponse = await templatesService.getAll();
        setTemplates(templatesResponse.results || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadInitialData();
  }, []);

  const onSubmit = async (data: CertificateFormData) => {
    setLoading(true);
    setError(null);

    try {
      await certificatesService.create(data);
      navigate('/certificates');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Issue Certificate</h2>
        <p className="text-slate-500">Create a new certificate for a recipient</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Creation Failed</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Certificate Number *
                </label>
                <Controller
                  name="certificate_number"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g., CERT-2024-001" />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Template *
                </label>
                <Controller
                  name="template"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value ? String(field.value) : ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={String(template.id)}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                Title *
              </label>
              <Controller
                name="title"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g., Full Stack Development" />
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                Description *
              </label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter certificate description..."
                    {...field}
                  />
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Recipient Name *
                </label>
                <Controller
                  name="recipient_name"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g., John Doe" />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Recipient Email *
                </label>
                <Controller
                  name="recipient_email"
                  control={form.control}
                  render={({ field }) => (
                    <Input {...field} type="email" placeholder="john@example.com" />
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/certificates')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading} disabled={loading}>
                Issue Certificate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}