import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  FolderOpen,
  Award,
  Download,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Sparkles,
  QrCode,
  Calendar,
  Building,
  User,
  GraduationCap,
  ShieldCheck,
  Tag,
  Search,
  CheckCircle
} from 'lucide-react';
import { templatesService } from '@/services/templates.service';
import { certificatesService } from '@/services/certificates.service';
import type { Template, Certificate } from '@/types';

export function CertificatesCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTemplateId = searchParams.get('template') || '';

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Wizard Step (1: Choose Purpose/Template, 2: Enter Dynamic Credentials, 3: Live Preview & Issue)
  const [step, setStep] = useState(1);

  // Filter and search for templates
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form Fields (Dynamic Credentials)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(preselectedTemplateId);
  const [recipientName, setRecipientName] = useState('Rahul Sharma');
  const [recipientEmail, setRecipientEmail] = useState('rahul.sharma@example.com');
  const [eventName, setEventName] = useState('National Coding Challenge 2026');
  const [achievement, setAchievement] = useState('First Place');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [organization, setOrganization] = useState('ABC Institute of Technology');
  const [certificateNumber, setCertificateNumber] = useState('');
  
  // Signatory & Smart Template Fields
  const [signatoryName, setSignatoryName] = useState('Dr. Rajesh Kumar');
  const [signatoryTitle, setSignatoryTitle] = useState('Dean of Academic Affairs');
  const [rank, setRank] = useState('First Place (Rank 1)');
  const [duration, setDuration] = useState('8 Weeks (120 Hours)');
  const [instructor, setInstructor] = useState('Prof. Vikram Singh');
  const [teamName, setTeamName] = useState('CodeCraft Titans');
  const [role, setRole] = useState('Full Stack Developer Intern');
  const [hours, setHours] = useState('50');

  // Generated Certificate Success State
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Live Preview QR Data URL
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');

  // Form Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchNextId();
    loadTemplates();
  }, []);

  const fetchNextId = async () => {
    try {
      const res = await certificatesService.getNextNumber();
      if (res && res.next_number) {
        setCertificateNumber(res.next_number);
      }
    } catch {
      const year = new Date().getFullYear();
      setCertificateNumber(`CERT-${year}-000001`);
    }
  };

  const loadTemplates = async () => {
    setDataLoading(true);
    try {
      const response = await templatesService.getAll();
      const activeTemplates = (response.results || []).filter(t => t.is_active);
      setTemplates(activeTemplates);
      
      // Auto-select template if query param or default
      if (preselectedTemplateId && activeTemplates.some(t => t.id === preselectedTemplateId)) {
        setSelectedTemplateId(preselectedTemplateId);
        setStep(2); // Jump straight to details if preselected from templates gallery
      } else if (activeTemplates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(activeTemplates[0].id);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Update defaults when a template is selected
  const handleSelectTemplate = (tpl: Template) => {
    setSelectedTemplateId(tpl.id);
    if (tpl.name.includes('Hackathon')) {
      setAchievement('Winner — Innovation Track');
      setEventName('Global AI Hackathon 2026');
      setRank('1st Place');
    } else if (tpl.name.includes('Completion')) {
      setAchievement('Full Course Completion');
      setEventName('Full-Stack Web Engineering Bootcamp');
      setDuration('12 Weeks');
    } else if (tpl.name.includes('Participation')) {
      setAchievement('Active Participant');
      setEventName('Annual Tech Symposium 2026');
    } else if (tpl.name.includes('Excellence')) {
      setAchievement('Excellence with High Honors');
      setRank('Rank 1');
    } else if (tpl.name.includes('Internship')) {
      setAchievement('Internship Completion');
      setRole('Software Engineering Intern');
      setDuration('3 Months');
    } else if (tpl.name.includes('Workshop')) {
      setAchievement('Hands-on Workshop Completion');
      setEventName('Cloud Architecture & Microservices Workshop');
      setInstructor('Prof. Rajesh Verma');
    }
  };

  // Generate QR for Preview Step
  useEffect(() => {
    if (step === 3 && certificateNumber) {
      const origin = window.location.origin;
      const verifyUrl = `${origin}/verify/${certificateNumber}`;
      QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 140,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(url => {
        setPreviewQrUrl(url);
      }).catch(err => {
        console.error('Failed to generate preview QR:', err);
      });
    }
  }, [step, certificateNumber]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    templates.forEach(t => {
      if (t.category_name) cats.add(t.category_name);
    });
    return Array.from(cats);
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.purpose && t.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || t.category_name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  // Interpolated dynamic wording for live preview
  const resolvedWording = useMemo(() => {
    if (!selectedTemplate) return '';
    const pattern = selectedTemplate.wording_pattern || 'for outstanding achievement in {{EVENT_NAME}}';
    return pattern
      .replace(/{{STUDENT_NAME}}/g, recipientName || 'STUDENT NAME')
      .replace(/{{NAME}}/g, recipientName || 'STUDENT NAME')
      .replace(/{{EVENT_NAME}}/g, eventName || 'EVENT NAME')
      .replace(/{{COURSE_NAME}}/g, eventName || 'COURSE NAME')
      .replace(/{{ACHIEVEMENT}}/g, achievement || 'OUTSTANDING ACHIEVEMENT')
      .replace(/{{ORGANIZATION_NAME}}/g, organization || 'ORGANIZATION')
      .replace(/{{DATE}}/g, issueDate || 'DATE')
      .replace(/{{RANK}}/g, rank || '1st Place')
      .replace(/{{DURATION}}/g, duration || '4 Weeks')
      .replace(/{{INSTRUCTOR}}/g, instructor || 'Course Mentor')
      .replace(/{{TEAM_NAME}}/g, teamName || 'Team')
      .replace(/{{ROLE}}/g, role || 'Intern')
      .replace(/{{HOURS}}/g, hours || '50');
  }, [selectedTemplate, recipientName, eventName, achievement, organization, issueDate, rank, duration, instructor, teamName, role, hours]);

  // Validation
  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (!recipientName.trim()) errors.recipientName = 'Recipient Name is required';
    if (!recipientEmail.trim()) {
      errors.recipientEmail = 'Recipient Email is required';
    } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      errors.recipientEmail = 'Invalid Email address';
    }
    if (!eventName.trim()) errors.eventName = 'Event or Course Title is required';
    if (!organization.trim()) errors.organization = 'Organization Name is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit and Issue Certificate
  const handleIssueCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: eventName,
        description: resolvedWording,
        template: selectedTemplate.id,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        achievement: achievement,
        organization_name: organization,
        signatory_name: signatoryName,
        signatory_title: signatoryTitle,
        certificate_number: certificateNumber,
        metadata: {
          rank,
          duration,
          instructor,
          team_name: teamName,
          role,
          hours,
          issue_date: issueDate
        }
      };

      const cert = await certificatesService.create(payload as any);
      setCreatedCertificate(cert);
    } catch (err: any) {
      console.error('Failed to issue certificate:', err);
      setError(err.response?.data?.error || 'Failed to issue certificate. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!createdCertificate) return;
    setDownloadingPdf(true);
    try {
      await certificatesService.downloadPdf(
        createdCertificate.id,
        `${createdCertificate.certificate_number}.pdf`
      );
    } catch (err) {
      alert('Failed to download PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200">
              CertiGen Studio
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              ID: {certificateNumber || 'Auto-Generating'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Issue Digital Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select from 15 purpose-driven templates, fill in the dynamic recipient credentials, and generate instant verified PDFs.
          </p>
        </div>

        {/* Wizard Progress Steps */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            step === 1 ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Purpose & Template</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            step === 2 ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Credentials</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            step === 3 ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>Preview & Issue</span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          STEP 1: SELECT PURPOSE & TEMPLATE (15 PURPOSE-BASED CERTIFICATE TEMPLATES)
          ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                1. Select Certificate Purpose & Design ({templates.length} Templates Available)
              </h2>
              <p className="text-xs text-slate-500">
                Each template provides customized typography, wording structures, and color themes.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Purposes ({templates.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => {
              const isSelected = selectedTemplateId === tpl.id;
              const primaryColor = tpl.primary_color || '#0f2744';
              const secondaryColor = tpl.secondary_color || '#c59b27';

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`group relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/40 shadow-md ring-2 ring-sky-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div>
                    {/* Mini Visual Preview Canvas Box */}
                    <div 
                      className="w-full h-28 rounded-xl mb-3 flex flex-col items-center justify-center p-2 relative overflow-hidden border"
                      style={{ 
                        backgroundColor: '#fafaf9',
                        borderColor: secondaryColor 
                      }}
                    >
                      {/* Decorative inner frame */}
                      <div 
                        className="w-full h-full border border-dashed rounded-lg flex flex-col items-center justify-center p-2"
                        style={{ borderColor: primaryColor }}
                      >
                        <span 
                          className="text-[9px] font-black uppercase tracking-widest text-center"
                          style={{ color: secondaryColor }}
                        >
                          {tpl.badge_text || 'VERIFIED CREDENTIAL'}
                        </span>
                        <h4 
                          className="text-xs font-black uppercase tracking-tight text-center mt-0.5 line-clamp-1"
                          style={{ color: primaryColor }}
                        >
                          {tpl.name}
                        </h4>
                        <div 
                          className="w-12 h-0.5 my-1"
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <span className="text-[9px] italic text-slate-500 font-serif">
                          {tpl.presentation_line || 'Awarded to'}
                        </span>
                      </div>
                    </div>

                    {/* Template Meta */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium bg-slate-50">
                        {tpl.category_name || 'General'}
                      </Badge>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] font-semibold text-slate-500 truncate">
                        {tpl.subtitle || 'HONOR'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tpl.purpose || tpl.description || 'Purpose-built certificate format'}
                    </p>
                  </div>

                  {/* Footer Dynamic Fields List */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <span className="text-slate-400 font-mono text-[10px]">Theme</span>
                    </div>
                    <span className="font-bold text-sky-600 flex items-center gap-1 text-[11px]">
                      Select & Continue →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              className="gap-2 px-6 font-bold shadow-md shadow-sky-600/20"
              onClick={() => {
                if (selectedTemplate) setStep(2);
              }}
            >
              Next: Enter Credentials
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: ENTER DYNAMIC CREDENTIALS (UNIFIED DYNAMIC FORM)
          ========================================================================= */}
      {step === 2 && selectedTemplate && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Selected Template Chip */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: selectedTemplate.primary_color || '#0f2744' }}
              >
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                    Selected Template:
                  </span>
                  <span className="text-xs bg-sky-200/80 text-sky-800 px-2 py-0.5 rounded-full font-semibold">
                    {selectedTemplate.category_name}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedTemplate.name}</h3>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="h-8 text-xs font-semibold"
            >
              Change Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Recipient Information */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <User className="w-4 h-4 text-sky-600" />
                    1. Recipient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Student / Recipient Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className={`text-sm ${validationErrors.recipientName ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.recipientName && (
                        <p className="text-[11px] text-red-500">{validationErrors.recipientName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Recipient Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className={`text-sm ${validationErrors.recipientEmail ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.recipientEmail && (
                        <p className="text-[11px] text-red-500">{validationErrors.recipientEmail}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Event & Organization Information */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <Building className="w-4 h-4 text-indigo-600" />
                    2. Event, Course & Organization Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Event, Course, or Program Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={eventName}
                      onChange={e => setEventName(e.target.value)}
                      placeholder="e.g. National Coding Challenge 2026"
                      className={`text-sm ${validationErrors.eventName ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.eventName && (
                      <p className="text-[11px] text-red-500">{validationErrors.eventName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Organization / Institute Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="e.g. ABC Institute"
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Date of Issuance
                      </Label>
                      <Input
                        type="date"
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Smart Template-Specific Fields */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <Award className="w-4 h-4 text-amber-600" />
                    3. Achievement & Credential Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Dynamic variables will be automatically merged into the certificate text.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Primary Achievement Title / Honor
                    </Label>
                    <Input
                      value={achievement}
                      onChange={e => setAchievement(e.target.value)}
                      placeholder="e.g. First Place / Outstanding Achievement / Course Completion"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Rank / Position (for Hackathon, Sports, Excellence, Merit) */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Rank / Position (if applicable)
                      </Label>
                      <Input
                        value={rank}
                        onChange={e => setRank(e.target.value)}
                        placeholder="e.g. First Place / Rank 1"
                        className="text-sm"
                      />
                    </div>

                    {/* Duration (for Course, Internship, Training) */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Duration / Hours (if applicable)
                      </Label>
                      <Input
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="e.g. 8 Weeks / 3 Months / 40 Hours"
                        className="text-sm"
                      />
                    </div>

                    {/* Instructor / Mentor Name (for Workshop, Course) */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Instructor / Mentor Name
                      </Label>
                      <Input
                        value={instructor}
                        onChange={e => setInstructor(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Verma"
                        className="text-sm"
                      />
                    </div>

                    {/* Team Name or Role (for Hackathon, Internship, Leadership) */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Team Name or Role (if applicable)
                      </Label>
                      <Input
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="e.g. ByteCrafters / Full Stack Intern"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 4: Signatory Information */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    4. Authorized Signatory
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Signatory Name
                      </Label>
                      <Input
                        value={signatoryName}
                        onChange={e => setSignatoryName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Kumar"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Signatory Title / Designation
                      </Label>
                      <Input
                        value={signatoryTitle}
                        onChange={e => setSignatoryTitle(e.target.value)}
                        placeholder="e.g. Dean of Academic Affairs"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Templates
                </Button>
                <Button
                  onClick={() => {
                    if (validateDetails()) setStep(3);
                  }}
                  className="gap-2 px-6 font-bold shadow-md shadow-sky-600/20"
                >
                  Preview Live Certificate
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Live Text Inspector (1 Col) */}
            <div className="space-y-4">
              <Card className="border-slate-200/80 shadow-xs sticky top-20 bg-slate-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Dynamic Interpolation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    How the template wording renders with your input:
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Title Header:
                    </span>
                    <p className="font-bold text-slate-800">
                      {selectedTemplate.title_prefix} {selectedTemplate.subtitle}
                    </p>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
                      Presentation Line:
                    </span>
                    <p className="italic text-slate-600 font-serif">
                      {selectedTemplate.presentation_line}
                    </p>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
                      Student Name:
                    </span>
                    <p className="font-extrabold text-sm text-sky-700 font-serif">
                      {recipientName || '{{STUDENT_NAME}}'}
                    </p>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
                      Resolved Wording:
                    </span>
                    <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-2 rounded border border-slate-200/60 font-serif">
                      "{resolvedWording}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ReportLab vector PDF will render with high-res typography & QR code.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: LIVE REALISTIC CERTIFICATE PREVIEW & ISSUE ACTION
          ========================================================================= */}
      {step === 3 && selectedTemplate && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                3. Live Certificate Preview & Issuance
              </h2>
              <p className="text-xs text-slate-500">
                Verify the rendered certificate layout and scan the real-time QR code.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Edit Details
              </Button>
              <Button
                onClick={handleIssueCertificate}
                disabled={loading}
                className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Generate & Issue Certificate
              </Button>
            </div>
          </div>

          {/* REALISTIC CERTIFICATE CANVAS */}
          <div 
            className="w-full bg-[#fdfdfe] rounded-3xl shadow-xl overflow-hidden relative p-8 sm:p-12 border transition-all"
            style={{ 
              borderColor: selectedTemplate.primary_color || '#0f2744',
              borderWidth: '4px'
            }}
          >
            {/* Inner Gold / Accent Border */}
            <div 
              className="w-full h-full border-2 rounded-2xl p-6 sm:p-10 relative flex flex-col justify-between items-center text-center"
              style={{ borderColor: selectedTemplate.secondary_color || '#c59b27' }}
            >
              {/* Corner Ornaments */}
              <div 
                className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2"
                style={{ borderColor: selectedTemplate.secondary_color || '#c59b27' }}
              />
              <div 
                className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2"
                style={{ borderColor: selectedTemplate.secondary_color || '#c59b27' }}
              />
              <div 
                className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2"
                style={{ borderColor: selectedTemplate.secondary_color || '#c59b27' }}
              />
              <div 
                className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2"
                style={{ borderColor: selectedTemplate.secondary_color || '#c59b27' }}
              />

              {/* 1. Header & Title */}
              <div className="space-y-1 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  {selectedTemplate.badge_text || 'CERTIGEN VERIFIED CREDENTIAL'}
                </span>
                <h2 
                  className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-serif"
                  style={{ color: selectedTemplate.primary_color || '#0f2744' }}
                >
                  {selectedTemplate.title_prefix || 'CERTIFICATE OF'}
                </h2>
                <h3 
                  className="text-lg sm:text-xl font-bold uppercase tracking-widest"
                  style={{ color: selectedTemplate.secondary_color || '#c59b27' }}
                >
                  {selectedTemplate.subtitle || 'ACHIEVEMENT'}
                </h3>
                <div 
                  className="w-24 h-0.5 mx-auto mt-2"
                  style={{ backgroundColor: selectedTemplate.secondary_color || '#c59b27' }}
                />
              </div>

              {/* 2. Presentation Line & Recipient */}
              <div className="my-6 space-y-2 max-w-2xl">
                <p className="italic text-slate-600 font-serif text-sm sm:text-base">
                  {selectedTemplate.presentation_line || 'This is proudly presented to'}
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif tracking-wide border-b-2 border-slate-200 pb-2 inline-block px-8">
                  {recipientName}
                </h1>
                <p className="text-sm sm:text-base text-slate-700 italic font-serif leading-relaxed mt-3 px-4">
                  "{resolvedWording}"
                </p>
              </div>

              {/* 3. QR Code & Serial Section */}
              <div className="my-4 flex flex-col items-center">
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs mb-2">
                  {previewQrUrl ? (
                    <img src={previewQrUrl} alt="Verification QR" className="w-24 h-24 sm:w-28 sm:h-28" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Scan to Verify Authenticity
                </span>
                <span 
                  className="font-mono text-xs sm:text-sm font-bold mt-0.5"
                  style={{ color: selectedTemplate.primary_color || '#0f2744' }}
                >
                  Certificate ID: {certificateNumber}
                </span>
              </div>

              {/* 4. Left & Right Footers */}
              <div className="w-full flex items-end justify-between pt-6 border-t border-slate-100 text-left text-xs">
                {/* Left Footer */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Issued On:
                  </span>
                  <p className="font-semibold text-slate-900 font-serif">
                    {new Date(issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p 
                    className="font-bold text-xs"
                    style={{ color: selectedTemplate.primary_color || '#0f2744' }}
                  >
                    {organization}
                  </p>
                </div>

                {/* Right Footer (Signatory) */}
                <div className="text-right space-y-1">
                  <div className="w-36 border-b border-slate-300 ml-auto mb-1" />
                  <p 
                    className="font-serif italic font-bold text-sm"
                    style={{ color: selectedTemplate.primary_color || '#0f2744' }}
                  >
                    {signatoryName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {signatoryTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL UPON GENERATION */}
      {createdCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-2">
                ✓ Successfully Issued & Verified
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Certificate Ready!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Issued to <strong>{createdCertificate.recipient_name}</strong> for {createdCertificate.title}.
              </p>
            </div>

            {/* Certificate ID Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Serial ID:</span>
              <span className="text-sky-700">{createdCertificate.certificate_number}</span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="h-11 font-bold bg-sky-600 hover:bg-sky-500 text-white gap-2 shadow-sm"
              >
                {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </Button>
              <a
                href={`/verify/${createdCertificate.certificate_number}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  className="w-full h-11 font-bold border-slate-300 hover:bg-slate-50 gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                  Public Verify
                </Button>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCreatedCertificate(null);
                  navigate('/certificates');
                }}
                className="text-xs text-slate-500"
              >
                Go to Certificate Ledger
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCreatedCertificate(null);
                  setStep(1);
                  fetchNextId();
                }}
                className="text-xs text-sky-600 font-bold"
              >
                + Issue Another Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}