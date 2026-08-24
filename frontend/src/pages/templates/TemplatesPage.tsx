import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileCheck, Edit, Trash2 } from 'lucide-react';
import { templatesService } from '@/services/templates.service';
import type { Template } from '@/types';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesService.getAll();
      setTemplates(response.results || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-slate-500">Manage certificate templates</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="h-48 bg-slate-100 flex items-center justify-center">
                    <FileCheck className="h-16 w-16 text-slate-400" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">ID: {template.id}</Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {templates.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileCheck className="mx-auto h-16 w-16 text-slate-300" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No templates found</h3>
              <p className="mt-1 text-sm text-slate-500">Get started by creating a new template.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}