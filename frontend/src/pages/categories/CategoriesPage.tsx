import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { categoriesService } from '@/services/categories.service';
import type { Category } from '@/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesService.getAll();
      setCategories(response.results || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-slate-500">Manage certificate categories</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search categories..."
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
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-slate-400">?</span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No categories found</h3>
              <p className="mt-1 text-sm text-slate-500">Get started by creating a new category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { Button } from '@/components/ui/button';