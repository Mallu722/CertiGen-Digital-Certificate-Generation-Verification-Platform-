import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from '@/components/ui/modal';
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { categoriesService } from '@/services/categories.service';
import type { Category } from '@/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesService.getAll();
      setCategories(response.results || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setName(category.name);
    setDescription(category.description);
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Category name is required');

    setSubmitLoading(true);
    setFormError(null);
    try {
      await categoriesService.create({ name, description });
      setIsCreateOpen(false);
      fetchCategories();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Failed to create category.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!name.trim()) return setFormError('Category name is required');

    setSubmitLoading(true);
    setFormError(null);
    try {
      await categoriesService.update(selectedCategory.id, { name, description });
      setIsEditOpen(false);
      fetchCategories();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Failed to update category.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setSubmitLoading(true);
    try {
      await categoriesService.delete(selectedCategory.id);
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-slate-500">Manage certificate categories</p>
        </div>
        <Button onClick={handleOpenCreate}>
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
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Name</th>
                    <th className="px-6 py-3.5 font-semibold">Description</th>
                    <th className="px-6 py-3.5 font-semibold">Created</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="bg-white border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-md truncate">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-sky-600 hover:bg-sky-50"
                            onClick={() => handleOpenEdit(category)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleOpenDelete(category)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCategories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>Create a new category for certificate templates.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="create-name">Category Name</Label>
                <Input 
                  id="create-name"
                  placeholder="e.g. Achievement, Course, Training" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-description">Description</Label>
                <textarea 
                  id="create-description"
                  placeholder="Describe this category..." 
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" isLoading={submitLoading} disabled={submitLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Modify category details.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input 
                  id="edit-name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-description">Description</Label>
                <textarea 
                  id="edit-description"
                  placeholder="Describe this category..." 
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" isLoading={submitLoading} disabled={submitLoading}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category <strong>{selectedCategory?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-slate-500 leading-relaxed py-2">
            This action cannot be undone. Templates assigned to this category will be impacted.
          </p>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteConfirm}
              isLoading={submitLoading}
              disabled={submitLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}