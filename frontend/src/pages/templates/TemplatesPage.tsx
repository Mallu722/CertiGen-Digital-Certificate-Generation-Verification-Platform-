import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FolderOpen,
  Award,
  Lock, 
  Unlock,
  KeyRound,
  Globe,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { templatesService } from '@/services/templates.service';
import { categoriesService } from '@/services/categories.service';
import { authService } from '@/services/auth.service';
import type { Template, Category } from '@/types';
import { StoreCertificateFrame } from '@/components/certificates/StoreCertificateFrame';
import { STORE_COLOR_THEMES, type StoreColorTheme } from '@/utils/certificateThemes';

export function TemplatesPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    setIsAdmin(authService.isAdmin());
  }, []);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewColorTheme, setPreviewColorTheme] = useState<StoreColorTheme>(STORE_COLOR_THEMES[0]);

  // Form states (Admin Create/Edit)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Mentor Private Template Unlock State
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [templateToUnlock, setTemplateToUnlock] = useState<Template | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<'preview' | 'issue' | null>(null);

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
    setIsPrivate(false);
    setAccessPassword('');
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
    setIsPrivate(template.is_private || false);
    setAccessPassword(template.access_password || '');
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsEditOpen(true);
  };

  // Open preview modal
  const handleOpenPreview = (template: Template) => {
    setSelectedTemplate(template);
    const matched = STORE_COLOR_THEMES.find(
      t => t.primary.toLowerCase() === (template.primary_color || '').toLowerCase()
    ) || STORE_COLOR_THEMES[0];
    setPreviewColorTheme(matched);
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

  // Check Private Access and Prompt Unlock if needed
  const handlePromptUnlock = (template: Template, action: 'preview' | 'issue') => {
    // If Admin or already unlocked or template is public
    if (isAdmin || !template.is_private || unlockedIds.has(template.id)) {
      if (action === 'preview') {
        handleOpenPreview(template);
      } else {
        navigate(`/certificates/create?template=${template.id}`);
      }
      return;
    }

    setTemplateToUnlock(template);
    setPendingAction(action);
    setEnteredPassword('');
    setUnlockError(null);
    setUnlockModalOpen(true);
  };

  // Submit Password to Unlock Template
  const handleConfirmUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateToUnlock) return;
    if (!enteredPassword.trim()) {
      setUnlockError('Please enter the template access password.');
      return;
    }

    setUnlockLoading(true);
    setUnlockError(null);
    try {
      await templatesService.unlock(templateToUnlock.id, enteredPassword.trim());
      setUnlockedIds(prev => new Set(prev).add(templateToUnlock.id));
      setUnlockModalOpen(false);

      if (pendingAction === 'preview') {
        handleOpenPreview(templateToUnlock);
      } else {
        navigate(`/certificates/create?template=${templateToUnlock.id}&password=${encodeURIComponent(enteredPassword.trim())}`);
      }
    } catch (err: any) {
      setUnlockError(err.response?.data?.error || 'Invalid passcode. Please contact your Administrator.');
    } finally {
      setUnlockLoading(false);
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Name is required');
    if (!categoryId) return setFormError('Category is required');
    if (isPrivate && !accessPassword.trim()) {
      return setFormError('Please specify an access password for this private template.');
    }

    setSubmitLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', categoryId);
    formData.append('is_active', String(isActive));
    formData.append('is_private', String(isPrivate));
    formData.append('access_password', isPrivate ? accessPassword.trim() : '');
    if (imageFile) {
      formData.append('image', imageFile);
    }

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
    if (isPrivate && !accessPassword.trim()) {
      return setFormError('Please specify an access password for this private template.');
    }

    setSubmitLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', categoryId);
    formData.append('is_active', String(isActive));
    formData.append('is_private', String(isPrivate));
    formData.append('access_password', isPrivate ? accessPassword.trim() : '');
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

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description.toLowerCase().includes(search.toLowerCase()) ||
    (template.purpose && template.purpose.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Certificate Templates</h1>
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
              {templates.length} Active
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin 
              ? 'Manage public and private certificate templates, set access passwords, and design themes.'
              : 'Browse and use purpose-built templates to issue verified digital credentials.'}
          </p>
        </div>
        
        {/* Admin only action */}
        {isAdmin && (
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Template
          </Button>
        )}
      </div>

      {/* Mentor notice banner */}
      {!isAdmin && (
        <div className="p-3.5 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-center gap-3 text-xs text-sky-800">
          <FolderOpen className="w-5 h-5 text-sky-600 shrink-0" />
          <span>
            <strong>Mentor Studio:</strong> You can browse public templates or unlock private templates with the password provided by your Administrator.
          </span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates by purpose or name..."
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
              {filteredTemplates.map((template) => {
                const isLocked = template.is_private && !isAdmin && !unlockedIds.has(template.id);
                return (
                  <Card key={template.id} className="overflow-hidden flex flex-col justify-between group border border-slate-200 hover:shadow-md transition-all duration-200">
                    <div>
                      {/* Header Preview Canvas */}
                      <div 
                        className="h-44 flex flex-col items-center justify-center relative overflow-hidden border-b p-3 text-center"
                        style={{ 
                          backgroundColor: '#fafaf9',
                          borderColor: template.secondary_color || '#c59b27'
                        }}
                      >
                        {template.image_url ? (
                          <img 
                            src={getImageUrl(template.image_url)} 
                            alt={template.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div 
                            className="w-full h-full rounded-xl border-2 border-dashed p-3 flex flex-col items-center justify-center relative bg-white/80 shadow-2xs"
                            style={{ borderColor: template.primary_color || '#0f2744' }}
                          >
                            <span 
                              className="text-[9px] font-black uppercase tracking-widest"
                              style={{ color: template.secondary_color || '#c59b27' }}
                            >
                              {template.badge_text || 'CERTIGEN VERIFIED CREDENTIAL'}
                            </span>
                            <h4 
                              className="text-xs font-black uppercase tracking-tight mt-1 line-clamp-1 font-serif"
                              style={{ color: template.primary_color || '#0f2744' }}
                            >
                              {template.title_prefix || 'CERTIFICATE OF'} {template.subtitle || 'HONOR'}
                            </h4>
                            <div 
                              className="w-10 h-0.5 my-1"
                              style={{ backgroundColor: template.secondary_color || '#c59b27' }}
                            />
                            <p className="text-[10px] italic text-slate-500 font-serif line-clamp-1">
                              {template.presentation_line || 'This is proudly presented to'}
                            </p>
                            <span className="text-[11px] font-bold text-slate-800 font-serif mt-0.5">
                              [STUDENT NAME]
                            </span>
                          </div>
                        )}
                        
                        {/* Top-Left: Public vs Private Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          {template.is_private ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 border bg-amber-50 text-amber-800 border-amber-300">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              Private
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium shadow-xs flex items-center gap-1 border bg-emerald-50 text-emerald-700 border-emerald-200">
                              <Globe className="w-2.5 h-2.5 text-emerald-600" />
                              Public
                            </span>
                          )}
                        </div>

                        {/* Top-Right: Active toggle (Admin only, read-only for mentor) */}
                        {isAdmin ? (
                          <button 
                            onClick={() => handleToggleStatus(template)}
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs flex items-center gap-1 border transition-all ${
                              template.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle active status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${template.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {template.is_active ? 'Active' : 'Inactive'}
                          </button>
                        ) : (
                          <span 
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs flex items-center gap-1 border ${
                              template.is_active 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${template.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {template.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>

                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-semibold">
                            <FolderOpen className="w-3 h-3 mr-1 text-slate-400" />
                            {getCategoryName(template.category)}
                          </Badge>
                          {template.purpose && (
                            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.2 rounded-full font-medium truncate max-w-[170px]">
                              {template.purpose}
                            </span>
                          )}
                        </div>

                        <CardTitle className="text-base text-slate-900 line-clamp-1 font-bold flex items-center justify-between">
                          <span>{template.name}</span>
                          {template.is_private && isLocked && (
                            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pb-3 text-xs text-slate-500">
                        <p className="line-clamp-2 leading-relaxed">
                          {template.wording_pattern ? `"${template.wording_pattern}"` : (template.description || 'Template layout with dynamic field interpolation.')}
                        </p>

                        {/* Admin Password Indicator */}
                        {isAdmin && template.is_private && template.access_password && (
                          <div className="mt-2 p-1.5 bg-amber-50/80 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-amber-600" />
                              Passcode:
                            </span>
                            <span className="font-mono font-bold">{template.access_password}</span>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <div className="p-3 bg-slate-50/70 border-t flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePromptUnlock(template, 'issue')}
                        className={`h-8 text-xs font-bold gap-1 shadow-xs ${
                          isLocked 
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-sky-600 hover:bg-sky-500 text-white'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Unlock & Issue
                          </>
                        ) : (
                          <>
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            Use to Issue
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-100" 
                          title="Preview Template"
                          onClick={() => handlePromptUnlock(template, 'preview')}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          Preview
                        </Button>

                        {isAdmin && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredTemplates.length === 0 && !loading && (
            <div className="text-center py-16 border rounded-2xl border-dashed">
              <FileCheck className="mx-auto h-16 w-16 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No templates found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                {isAdmin 
                  ? 'Create a new certificate template to start issuing customized digital credentials.'
                  : 'No templates have been configured yet. Please contact an Administrator.'}
              </p>
              {isAdmin && (
                <Button onClick={handleOpenCreate} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Create Template
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================================================================
          MENTOR PASSWORD UNLOCK MODAL
          ========================================================================= */}
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmUnlock}>
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <DialogTitle className="text-center text-lg font-black text-slate-900">
                Unlock Private Template
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-slate-500">
                <strong>{templateToUnlock?.name}</strong> is a restricted private template. Enter the passcode provided by your Administrator to access.
              </DialogDescription>
            </DialogHeader>

            {unlockError && (
              <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{unlockError}</span>
              </div>
            )}

            <div className="py-3 space-y-2">
              <Label htmlFor="passcode-input" className="text-xs font-semibold text-slate-700">
                Template Access Passcode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="passcode-input"
                type="password"
                placeholder="Enter passcode..."
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                autoFocus
                className="text-sm font-mono tracking-wider"
              />
              <p className="text-[11px] text-slate-400">
                Contact your Admin if you have not received the authorization passcode.
              </p>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUnlockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={unlockLoading}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                {unlockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4 mr-1" />}
                Unlock Access
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          CREATE TEMPLATE MODAL (ADMIN)
          ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>New Template</DialogTitle>
              <DialogDescription>Create a public or private certificate template.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="create-name">Template Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="create-name"
                  placeholder="e.g. VIP Honor Certificate" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-description">Description / Purpose</Label>
                <textarea 
                  id="create-description"
                  placeholder="Describe the purpose of this certificate..." 
                  className="flex min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="create-category">Category <span className="text-red-500">*</span></Label>
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

              {/* Visibility: Public vs Private with Password */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700 block">
                  Template Access Permission (Public / Private)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setIsPrivate(false)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      !isPrivate ? 'border-sky-600 bg-sky-50/50 shadow-xs ring-1 ring-sky-400' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Public</p>
                      <p className="text-[10px] text-slate-500">Free access to all mentors</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsPrivate(true)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      isPrivate ? 'border-amber-600 bg-amber-50/50 shadow-xs ring-1 ring-amber-400' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Private</p>
                      <p className="text-[10px] text-slate-500">Requires access passcode</p>
                    </div>
                  </div>
                </div>

                {/* Password field if Private */}
                {isPrivate && (
                  <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
                    <Label htmlFor="access-password" className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Set Template Access Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="access-password"
                      type="text"
                      placeholder="e.g. VIP2026, SECRET_PASS"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      className="text-sm font-mono border-amber-300 bg-amber-50/30"
                    />
                    <p className="text-[11px] text-amber-700">
                      Only mentors who enter this password will be able to preview or issue certificates with this template.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <Label htmlFor="create-image">Custom Background (Optional)</Label>
                <Input 
                  id="create-image"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  ref={fileInputRef}
                />
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
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          EDIT TEMPLATE MODAL (ADMIN)
          ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>Modify template visibility, passcode, or information.</DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Template Name <span className="text-red-500">*</span></Label>
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
                  className="flex min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-category">Category <span className="text-red-500">*</span></Label>
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

              {/* Visibility: Public vs Private with Password */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700 block">
                  Template Access Permission (Public / Private)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setIsPrivate(false)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      !isPrivate ? 'border-sky-600 bg-sky-50/50 shadow-xs ring-1 ring-sky-400' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Public</p>
                      <p className="text-[10px] text-slate-500">Free access to all mentors</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsPrivate(true)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      isPrivate ? 'border-amber-600 bg-amber-50/50 shadow-xs ring-1 ring-amber-400' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Private</p>
                      <p className="text-[10px] text-slate-500">Requires access passcode</p>
                    </div>
                  </div>
                </div>

                {isPrivate && (
                  <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
                    <Label htmlFor="edit-access-password" className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Set Template Access Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-access-password"
                      type="text"
                      placeholder="e.g. VIP2026, SECRET_PASS"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      className="text-sm font-mono border-amber-300 bg-amber-50/30"
                    />
                    <p className="text-[11px] text-amber-700">
                      Only mentors who enter this password will be able to preview or issue certificates with this template.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <Label htmlFor="edit-image">Replace Template Image (Optional)</Label>
                <Input 
                  id="edit-image"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  ref={fileInputRef}
                />
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

      {/* =========================================================================
          PREVIEW MODAL - AUTHENTIC STORE-STYLE CERTIFICATE PREVIEW
          ========================================================================= */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                Official Store Certificate Preview
              </span>
              <span className="text-xs text-slate-400">•</span>
              {selectedTemplate?.is_private ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-300">
                  <Lock className="w-3 h-3" /> Private Protected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                  <Globe className="w-3 h-3" /> Public
                </span>
              )}
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 mt-1">
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Review layout design, ornate store filigree borders, gold embossed seal, and test color themes.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-2">
              {/* Admin Passcode Display */}
              {isAdmin && selectedTemplate.is_private && selectedTemplate.access_password && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    Admin Access Passcode:
                  </span>
                  <span className="font-mono font-black text-sm bg-white px-3 py-1 rounded-xl border border-amber-200">
                    {selectedTemplate.access_password}
                  </span>
                </div>
              )}

              {/* Store Color Themes Switcher */}
              <div className="p-3 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Store Colorway:
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {previewColorTheme.description}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STORE_COLOR_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setPreviewColorTheme(theme)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                        previewColorTheme.id === theme.id 
                          ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900 text-slate-900' 
                          : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center -space-x-1">
                        <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: theme.primary }} />
                        <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: theme.secondary }} />
                      </div>
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* REALISTIC STORE CERTIFICATE CANVAS */}
              <div className="p-1 sm:p-2 bg-slate-100/60 rounded-2xl border border-slate-200 overflow-x-auto shadow-inner">
                <StoreCertificateFrame
                  titlePrefix={selectedTemplate.title_prefix || 'CERTIFICATE OF'}
                  subtitle={selectedTemplate.subtitle || 'ACHIEVEMENT'}
                  presentationLine={selectedTemplate.presentation_line || 'This is proudly presented to'}
                  recipientName="MALLIKARJUN HIREMATH"
                  resolvedWording={
                    selectedTemplate.wording_pattern
                      ? selectedTemplate.wording_pattern
                          .replace(/{{STUDENT_NAME}}/g, 'MALLIKARJUN HIREMATH')
                          .replace(/{{NAME}}/g, 'MALLIKARJUN HIREMATH')
                          .replace(/{{EVENT_NAME}}/g, 'National Innovation & AI Hackathon 2026')
                          .replace(/{{COURSE_NAME}}/g, 'Full-Stack Software Engineering')
                          .replace(/{{ACHIEVEMENT}}/g, 'First Place Distinction')
                          .replace(/{{ORGANIZATION_NAME}}/g, 'CertiGen Institute of Technology')
                          .replace(/{{RANK}}/g, '1st Place')
                          .replace(/{{DURATION}}/g, '8 Weeks')
                          .replace(/{{INSTRUCTOR}}/g, 'Prof. Alan Turing')
                          .replace(/{{TEAM_NAME}}/g, 'CodeCrafters')
                          .replace(/{{ROLE}}/g, 'Software Engineer Intern')
                          .replace(/{{HOURS}}/g, '60')
                      : 'for demonstrating exceptional distinction, perseverance, and scholastic excellence in National Innovation & AI Hackathon 2026'
                  }
                  badgeText={selectedTemplate.badge_text || 'EXCELLENCE AWARD'}
                  organizationName="CertiGen Institute of Technology"
                  instituteSubtitle="Accredited Verification Authority & Academic Standards"
                  primaryColor={previewColorTheme.primary}
                  secondaryColor={previewColorTheme.secondary}
                  accentColor={previewColorTheme.accent}
                  certificateNumber="CERT-2026-000001"
                  issueDate={new Date().toISOString().split('T')[0]}
                  signatoryName="Dr. Rajesh Kumar"
                  signatoryTitle="Dean of Academic Affairs"
                  secondSignatoryName="Prof. Vikram Singh"
                  secondSignatoryTitle="Director of Certification"
                />
              </div>

              {/* Template Meta Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700">Category: </span>
                  <span>{getCategoryName(selectedTemplate.category)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Status: </span>
                  <Badge variant={selectedTemplate.is_active ? 'success' : 'secondary'} className="py-0 px-2 text-[10px]">
                    {selectedTemplate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Registered: </span>
                  <span>{new Date(selectedTemplate.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 border-t pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Close Preview
              </Button>
            </DialogClose>
            {selectedTemplate && (
              <Button 
                onClick={() => handlePromptUnlock(selectedTemplate, 'issue')}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 font-bold gap-2 text-white shadow-md shadow-sky-600/20"
              >
                <Award className="w-4 h-4 text-amber-300" />
                Use This Template to Issue Certificate →
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          DELETE CONFIRM MODAL (ADMIN)
          ========================================================================= */}
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