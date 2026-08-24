import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  FileCheck, 
  Edit, 
  Trash2, 
  Eye, 
  Check, 
  X,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { templatesService } from '@/services/templates.service';
import { categoriesService } from '@/services/categories.service';
import type { Template, Category } from '@/types';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, categoriesRes] = await Promise.all([
        templatesService.getAll(),
        categoriesService.getAll()
      ]);
      setTemplates(templatesRes.results || []);
      setCategories(categoriesRes.results || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Unknown Category';
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8000${url}`;
  };

  // Open create modal
  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setImageFile(null);
    setIsActive(true);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsCreateOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (template: Template) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setCategoryId(template.category);
    setImageFile(null);
    setIsActive(template.is_active);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsEditOpen(true);
  };

  // Open preview modal
  const handleOpenPreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  // Open delete confirm
  const handleOpenDelete = (template: Template) => {
    setSelectedTemplate(template);
    setIsDeleteOpen(true);
  };

  // Handle status toggle directly from card
  const handleToggleStatus = async (template: Template) => {
    try {
      const updated = await templatesService.update(template.id, {
        is_active: !template.is_active
      });
      setTemplates(templates.map(t => t.id === template.id ? updated : t));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Name is required');
    if (!categoryId) return setFormError('Category is required');
    if (!imageFile) return setFormError('Template background image is required');

    setSubmitLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', categoryId);
    formData.append('is_active', String(isActive));
    formData.append('image', imageFile);

    try {
      await templatesService.create(formData);
      setIsCreateOpen(false);
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Failed to create template. Please check the inputs.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    if (!name.trim()) return setFormError('Name is required');
    if (!categoryId) return setFormError('Category is required');

    setSubmitLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', categoryId);
    formData.append('is_active', String(isActive));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await templatesService.update(selectedTemplate.id, formData);
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Failed to update template.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    setSubmitLoading(true);
    try {
      await templatesService.delete(selectedTemplate.id);
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to delete template:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filtered list
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-slate-500">Create and manage certificate layouts and categories</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden flex flex-col justify-between group border border-slate-200 hover:shadow-md transition-all duration-200">
                  <div>
                    {/* Header Image Preview */}
                    <div className="h-44 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b">
                      {template.image_url ? (
                        <img 
                          src={getImageUrl(template.image_url)} 
                          alt={template.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <FileCheck className="h-16 w-16 text-slate-300" />
                      )}
                      
                      {/* Floating status toggle */}
                      <button 
                        onClick={() => handleToggleStatus(template)}
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 border transition-all ${
                          template.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${template.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {template.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium">
                          <FolderOpen className="w-3 h-3 mr-1" />
                          {getCategoryName(template.category)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-slate-800 line-clamp-1">{template.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <p className="text-sm text-slate-500 line-clamp-2 h-10">
                        {template.description || 'No description provided.'}
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Added {new Date(template.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:bg-slate-100" 
                        title="Preview"
                        onClick={() => handleOpenPreview(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-sky-600 hover:bg-sky-50"
                        title="Edit"
                        onClick={() => handleOpenEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                        onClick={() => handleOpenDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && !loading && (
            <div className="text-center py-16 border rounded-2xl border-dashed">
              <FileCheck className="mx-auto h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No templates found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                Create a new certificate template to start issuing customized digital credentials.
              </p>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>New Template</DialogTitle>
              <DialogDescription>Create a new certificate design layout.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="create-name">Template Name</Label>
                <Input 
                  id="create-name"
                  placeholder="e.g. Achievement Certificate" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-description">Description</Label>
                <textarea 
                  id="create-description"
                  placeholder="Describe this template..." 
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-image">Template Image / SVG</Label>
                <Input 
                  id="create-image"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  ref={fileInputRef}
                />
                <p className="text-xs text-slate-400">Upload a background image for certificates generated with this layout.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="create-active" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <Label htmlFor="create-active" className="cursor-pointer">Mark this template as active</Label>
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
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>Modify details of the template layout.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input 
                  id="edit-name"
                  placeholder="Template name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-description">Description</Label>
                <textarea 
                  id="edit-description"
                  placeholder="Describe this template..." 
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-image">Replace Template Image (Optional)</Label>
                <Input 
                  id="edit-image"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  ref={fileInputRef}
                />
                <p className="text-xs text-slate-400">Leave empty to keep the existing background image.</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="edit-active" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <Label htmlFor="edit-active" className="cursor-pointer">Mark this template as active</Label>
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

      {/* PREVIEW MODAL */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>Review layout styling and background representation.</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="font-medium text-slate-500">Name: </span>
                  <span className="text-slate-800 font-semibold">{selectedTemplate.name}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Category: </span>
                  <span className="text-slate-800 font-semibold">{getCategoryName(selectedTemplate.category)}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Status: </span>
                  <Badge variant={selectedTemplate.is_active ? 'success' : 'secondary'} className="py-0.5">
                    {selectedTemplate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Added: </span>
                  <span className="text-slate-600">{new Date(selectedTemplate.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedTemplate.description && (
                <p className="text-sm text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-1">Description:</span>
                  {selectedTemplate.description}
                </p>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 min-h-[250px] flex items-center justify-center relative">
                {selectedTemplate.image_url ? (
                  <img 
                    src={getImageUrl(selectedTemplate.image_url)} 
                    alt={selectedTemplate.name} 
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                    <FileCheck className="w-16 h-16 mb-2" />
                    <span>No image uploaded for this template.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template <strong>{selectedTemplate?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-slate-500 leading-relaxed py-2">
            This action cannot be undone. Certificates issued using this template will retain their references, but no new certificates can use it.
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
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}