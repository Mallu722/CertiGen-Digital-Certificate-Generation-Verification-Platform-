import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
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
  FileCheck, 
  ArrowRight, 
  ArrowLeft, 
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
  Building,
  User,
  ShieldCheck,
  Search,
  CheckCircle,
  Upload,
  Palette,
  Image as ImageIcon,
  X,
  Lock,
  Unlock,
  KeyRound,
  Globe,
  FileSpreadsheet,
  Mail,
  FileArchive,
  Users,
  Trash2,
  Plus,
  Send,
  DownloadCloud
} from 'lucide-react';
import { templatesService } from '@/services/templates.service';
import { certificatesService } from '@/services/certificates.service';
import { authService } from '@/services/auth.service';
import type { Template, Certificate } from '@/types';
import { StoreCertificateFrame } from '@/components/certificates/StoreCertificateFrame';
import { 
  STORE_COLOR_THEMES, 
  PRESET_INSTITUTE_LOGOS, 
  type StoreColorTheme, 
  type PresetInstituteLogo 
} from '@/utils/certificateThemes';

export interface BulkRecipient {
  recipient_name: string;
  recipient_email: string;
  achievement?: string;
  rank?: string;
  duration?: string;
  instructor?: string;
  team_name?: string;
  role?: string;
  hours?: string;
}

export function CertificatesCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTemplateId = searchParams.get('template') || '';
  const queryPassword = searchParams.get('password') || '';

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Issuance Mode: 'single' (manual 1 recipient) vs 'bulk' (Excel/CSV upload)
  const [issuanceMode, setIssuanceMode] = useState<'single' | 'bulk'>('single');

  // Wizard Step (1: Choose Template, 2: Enter/Upload Credentials, 3: Live Preview & Issue)
  const [step, setStep] = useState(1);

  // Filter and search for templates
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form Fields (Common / Single Details)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(preselectedTemplateId);
  const [recipientName, setRecipientName] = useState('Rahul Sharma');
  const [recipientEmail, setRecipientEmail] = useState('rahul.sharma@example.com');
  const [eventName, setEventName] = useState('National Coding Challenge 2026');
  const [achievement, setAchievement] = useState('First Place Distinction');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [organization, setOrganization] = useState('ABC Institute of Technology');
  const [instituteSubtitle, setInstituteSubtitle] = useState('Accredited Academic Authority & Standards');
  const [certificateNumber, setCertificateNumber] = useState('');

  // Store Color Theme & Institute Logo
  const [selectedColorTheme, setSelectedColorTheme] = useState<StoreColorTheme>(STORE_COLOR_THEMES[0]);
  const [selectedInstituteLogo, setSelectedInstituteLogo] = useState<string>(PRESET_INSTITUTE_LOGOS[0].svgDataUri);
  const [customLogoFileName, setCustomLogoFileName] = useState<string>('');
  
  // Signatory & Smart Template Fields
  const [signatoryName, setSignatoryName] = useState('Dr. Rajesh Kumar');
  const [signatoryTitle, setSignatoryTitle] = useState('Dean of Academic Affairs');
  const [secondSignatoryName, setSecondSignatoryName] = useState('Prof. Vikram Singh');
  const [secondSignatoryTitle, setSecondSignatoryTitle] = useState('Director of Certification');
  
  const [rank, setRank] = useState('First Place (Rank 1)');
  const [duration, setDuration] = useState('8 Weeks (120 Hours)');
  const [instructor, setInstructor] = useState('Prof. Alan Turing');
  const [teamName, setTeamName] = useState('CodeCraft Titans');
  const [role, setRole] = useState('Full Stack Developer Intern');
  const [hours, setHours] = useState('50');

  // ==========================================
  // BULK EXCEL / CSV MODE STATES
  // ==========================================
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [parsedRecipients, setParsedRecipients] = useState<BulkRecipient[]>([]);
  const [parseLoading, setParseLoading] = useState<boolean>(false);
  const [sendEmails, setSendEmails] = useState<boolean>(true);
  const [bulkBatchResult, setBulkBatchResult] = useState<{
    batch_id: string;
    total_issued: number;
    emails_sent: number;
    zip_filename: string;
    zip_relative_url: string;
    certificates: any[];
    errors: string[];
  } | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Private Template Unlock State
  const [templatePassword, setTemplatePassword] = useState<string>(queryPassword);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(
    queryPassword && preselectedTemplateId ? new Set([preselectedTemplateId]) : new Set()
  );
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [templateToUnlock, setTemplateToUnlock] = useState<Template | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  // Single Certificate Success State
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Live Preview QR Data URL
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');

  // Form Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
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
        setStep(2);
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

  // Sync color theme when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const match = STORE_COLOR_THEMES.find(
        t => t.primary.toLowerCase() === (selectedTemplate.primary_color || '').toLowerCase()
      );
      if (match) setSelectedColorTheme(match);
    }
  }, [selectedTemplate]);

  // Apply default wording and fields upon template selection
  const applyTemplateSelection = (tpl: Template, advanceToStep2: boolean = false) => {
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
    if (advanceToStep2) {
      setStep(2);
    }
  };

  // Intercept template selection if private & locked, otherwise advance to Step 2
  const handleSelectTemplate = (tpl: Template, advanceToStep2: boolean = true) => {
    if (tpl.is_private && !isAdmin && !unlockedIds.has(tpl.id)) {
      setTemplateToUnlock(tpl);
      setEnteredPassword('');
      setUnlockError(null);
      setUnlockModalOpen(true);
      return;
    }
    applyTemplateSelection(tpl, advanceToStep2);
  };

  // Handle mentor passcode submission
  const handleConfirmUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateToUnlock) return;
    if (!enteredPassword.trim()) {
      setUnlockError('Please enter the template access passcode.');
      return;
    }

    setUnlockLoading(true);
    setUnlockError(null);
    try {
      await templatesService.unlock(templateToUnlock.id, enteredPassword.trim());
      setUnlockedIds(prev => new Set(prev).add(templateToUnlock.id));
      setTemplatePassword(enteredPassword.trim());
      setUnlockModalOpen(false);
      applyTemplateSelection(templateToUnlock, true);
    } catch (err: any) {
      setUnlockError(err.response?.data?.error || 'Invalid passcode for this private template.');
    } finally {
      setUnlockLoading(false);
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

  // Handle Custom Logo File Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setSelectedInstituteLogo(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // BULK EXCEL HANDLERS
  // ==========================================

  // Instant Sample Demo Students Loader
  const handleLoadDemoStudents = () => {
    const demo = [
      {
        recipient_name: "Rahul Sharma",
        recipient_email: "rahul.sharma@example.com",
        achievement: "First Place Distinction",
        rank: "Rank 1",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "CodeCraft Titans",
        role: "Full Stack Developer",
        hours: "120"
      },
      {
        recipient_name: "Priya Patel",
        recipient_email: "priya.patel@example.com",
        achievement: "Outstanding Academic Merit",
        rank: "Rank 2",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "ByteWarriors",
        role: "AI Developer",
        hours: "120"
      },
      {
        recipient_name: "Amit Kumar",
        recipient_email: "amit.kumar@example.com",
        achievement: "Excellence in Innovation",
        rank: "Finalist",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "NeuralNodes",
        role: "Data Scientist",
        hours: "120"
      },
      {
        recipient_name: "Sneha Reddy",
        recipient_email: "sneha.reddy@example.com",
        achievement: "Distinguished Project Leader",
        rank: "Rank 3",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "QuantumBuilders",
        role: "Cloud Architect",
        hours: "120"
      }
    ];

    setExcelFileName('CertiGen_Bulk_Demo_Recipients.xlsx');
    setParsedRecipients(demo);
    setRecipientName("Rahul Sharma");
    setRecipientEmail("rahul.sharma@example.com");
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {

    const sampleData = [
      {
        recipient_name: "Rahul Sharma",
        recipient_email: "rahul.sharma@example.com",
        achievement: "First Place Distinction",
        rank: "Rank 1",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "CodeCraft Titans",
        role: "Full Stack Developer",
        hours: "120"
      },
      {
        recipient_name: "Priya Patel",
        recipient_email: "priya.patel@example.com",
        achievement: "Outstanding Academic Merit",
        rank: "Rank 2",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "ByteWarriors",
        role: "AI Developer",
        hours: "120"
      },
      {
        recipient_name: "Amit Kumar",
        recipient_email: "amit.kumar@example.com",
        achievement: "Excellence in Innovation",
        rank: "Finalist",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "NeuralNodes",
        role: "Data Scientist",
        hours: "120"
      },
      {
        recipient_name: "Sneha Reddy",
        recipient_email: "sneha.reddy@example.com",
        achievement: "Distinguished Project Leader",
        rank: "Rank 3",
        duration: "8 Weeks",
        instructor: "Prof. Alan Turing",
        team_name: "QuantumBuilders",
        role: "Cloud Architect",
        hours: "120"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recipients");
    XLSX.writeFile(wb, "CertiGen_Bulk_Recipients_Sample.xlsx");
  };

  // Handle Excel or CSV file upload and parse
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setParseLoading(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const normalized: BulkRecipient[] = rawRows.map(row => {
        const cleanKeys: Record<string, string> = {};
        Object.keys(row).forEach(k => {
          cleanKeys[k.trim().toLowerCase().replace(/ /g, '_').replace(/-/g, '_')] = String(row[k] || '').trim();
        });

        return {
          recipient_name: cleanKeys['recipient_name'] || cleanKeys['student_name'] || cleanKeys['name'] || cleanKeys['full_name'] || '',
          recipient_email: cleanKeys['recipient_email'] || cleanKeys['student_email'] || cleanKeys['email'] || cleanKeys['email_address'] || '',
          achievement: cleanKeys['achievement'] || cleanKeys['honor'] || cleanKeys['award'] || '',
          rank: cleanKeys['rank'] || cleanKeys['position'] || '',
          duration: cleanKeys['duration'] || cleanKeys['period'] || '',
          instructor: cleanKeys['instructor'] || cleanKeys['mentor'] || '',
          team_name: cleanKeys['team_name'] || cleanKeys['team'] || '',
          role: cleanKeys['role'] || cleanKeys['designation'] || '',
          hours: cleanKeys['hours'] || ''
        };
      }).filter(r => Boolean(r.recipient_name));

      if (normalized.length === 0) {
        setError('No valid student rows found in the uploaded file. Please ensure there is a "recipient_name" column.');
      } else {
        setParsedRecipients(normalized);
        // Set sample name for preview step
        setRecipientName(normalized[0].recipient_name);
        if (normalized[0].recipient_email) setRecipientEmail(normalized[0].recipient_email);
        if (normalized[0].achievement) setAchievement(normalized[0].achievement);
      }
    } catch (err: any) {
      console.error('Failed to parse Excel file:', err);
      // Fallback to backend parser
      try {
        const backendRes = await certificatesService.parseSheet(file);
        if (backendRes.recipients && backendRes.recipients.length > 0) {
          setParsedRecipients(backendRes.recipients);
          setRecipientName(backendRes.recipients[0].recipient_name);
        } else {
          setError('Failed to extract recipients from uploaded sheet.');
        }
      } catch (backendErr: any) {
        setError('Failed to parse sheet. Please ensure it is a valid .xlsx or .csv file.');
      }
    } finally {
      setParseLoading(false);
    }
  };

  // Remove a recipient from parsed list
  const handleRemoveRecipient = (indexToRemove: number) => {
    setParsedRecipients(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Add an empty recipient row
  const handleAddEmptyRecipient = () => {
    setParsedRecipients(prev => [
      ...prev,
      {
        recipient_name: 'New Student',
        recipient_email: 'student@example.com',
        achievement: achievement || 'Distinction',
      }
    ]);
  };

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
    if (!eventName.trim()) errors.eventName = 'Event or Course Title is required';
    if (!organization.trim()) errors.organization = 'Organization Name is required';

    if (issuanceMode === 'single') {
      if (!recipientName.trim()) errors.recipientName = 'Recipient Name is required';
      if (!recipientEmail.trim()) {
        errors.recipientEmail = 'Recipient Email is required';
      } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
        errors.recipientEmail = 'Invalid Email address';
      }
    } else {
      // Bulk Mode validation
      if (parsedRecipients.length === 0) {
        errors.excelFile = 'Please upload an Excel or CSV file containing recipients.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit and Issue Certificate (Single or Bulk)
  const handleIssueAction = async () => {
    if (issuanceMode === 'bulk') {
      handleBulkIssueCertificates();
    } else {
      handleSingleIssueCertificate();
    }
  };

  // Single Certificate Creation
  const handleSingleIssueCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: eventName,
        description: resolvedWording,
        template: selectedTemplate.id,
        template_password: templatePassword,
        password: templatePassword,
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
          issue_date: issueDate,
          primary_color: selectedColorTheme.primary,
          secondary_color: selectedColorTheme.secondary,
          accent_color: selectedColorTheme.accent,
          institute_logo_base64: selectedInstituteLogo,
          second_signatory_name: secondSignatoryName,
          second_signatory_title: secondSignatoryTitle
        }
      };

      const cert = await certificatesService.create(payload as any);
      setCreatedCertificate(cert);
    } catch (err: any) {
      console.error('Failed to issue certificate:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to issue certificate. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Certificates Creation
  const handleBulkIssueCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        template: selectedTemplate.id,
        template_password: templatePassword,
        password: templatePassword,
        recipients: JSON.stringify(parsedRecipients),
        send_email: sendEmails,
        title: eventName,
        achievement: achievement,
        organization_name: organization,
        institute_subtitle: instituteSubtitle,
        signatory_name: signatoryName,
        signatory_title: signatoryTitle,
        second_signatory_name: secondSignatoryName,
        second_signatory_title: secondSignatoryTitle,
        primary_color: selectedColorTheme.primary,
        secondary_color: selectedColorTheme.secondary,
        accent_color: selectedColorTheme.accent,
        institute_logo_base64: selectedInstituteLogo,
        issue_date: issueDate,
      };

      const result = await certificatesService.bulkIssue(payload);
      setBulkBatchResult(result);
    } catch (err: any) {
      console.error('Failed to execute bulk issuance:', err);
      setError(err.response?.data?.error || 'Failed to process bulk certificates.');
    } finally {
      setLoading(false);
    }
  };

  // Download Single PDF
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

  // Download Bulk ZIP Archive
  const handleDownloadBatchZip = async () => {
    if (!bulkBatchResult) return;
    setDownloadingZip(true);
    try {
      await certificatesService.downloadBatchZip(bulkBatchResult.zip_filename);
    } catch (err) {
      alert('Failed to download ZIP file.');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200">
              CertiGen Enterprise Studio
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {issuanceMode === 'bulk' ? `Batch: ${parsedRecipients.length} Recipients` : `ID: ${certificateNumber || 'Auto'}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Issue Digital Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate single certificates or upload an Excel sheet to bulk issue, create a single ZIP file, and email all recipients.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setIssuanceMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              issuanceMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Single Person</span>
          </button>
          
          <button
            onClick={() => setIssuanceMode('bulk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              issuanceMode === 'bulk'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Excel Sheet</span>
            <span className="bg-amber-400 text-amber-950 text-[9px] px-1.5 py-0.2 rounded-full font-black ml-0.5">
              NEW
            </span>
          </button>
        </div>
      </div>

      {/* Wizard Progress Steps */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            step === 1 ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>1. Select Template</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            step === 2 ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>{issuanceMode === 'bulk' ? '2. Upload Excel & Brand' : '2. Enter Details & Brand'}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            step === 3 ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>3. Live Preview & Issue</span>
          </div>
        </div>

        {issuanceMode === 'bulk' && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-semibold">
            <FileArchive className="w-3.5 h-3.5 text-sky-600" />
            Auto ZIP Archive & Direct Email Dispatch Active
          </span>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          STEP 1: SELECT PURPOSE & TEMPLATE (PUBLIC / PRIVATE BADGES)
          ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                1. Select Certificate Purpose & Design ({templates.length} Templates Available)
              </h2>
              <p className="text-xs text-slate-500">
                Each template provides customized typography, wording patterns, and color themes.
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
              const isLocked = tpl.is_private && !isAdmin && !unlockedIds.has(tpl.id);
              const primaryColor = tpl.primary_color || '#0f2744';
              const secondaryColor = tpl.secondary_color || '#c59b27';

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl, true)}
                  className={`group relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/40 shadow-md ring-2 ring-sky-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >

                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    {tpl.is_private ? (
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

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Store Mini Certificate Frame Preview */}
                    <div 
                      className="w-full h-32 rounded-xl mb-3 flex flex-col items-center justify-center p-2 relative overflow-hidden border font-serif"
                      style={{ 
                        backgroundColor: '#fafaf9',
                        borderColor: secondaryColor 
                      }}
                    >
                      <div 
                        className="w-full h-full border border-dashed rounded-lg flex flex-col items-center justify-between p-2 text-center"
                        style={{ borderColor: primaryColor }}
                      >
                        <span 
                          className="text-[8px] font-black uppercase tracking-widest font-sans"
                          style={{ color: secondaryColor }}
                        >
                          ★ {tpl.badge_text || 'VERIFIED CREDENTIAL'} ★
                        </span>
                        
                        <div>
                          <h4 
                            className="text-[11px] font-black uppercase tracking-tight line-clamp-1"
                            style={{ color: primaryColor }}
                          >
                            {tpl.name}
                          </h4>
                          <p className="text-[8px] italic text-slate-500 line-clamp-1">
                            {tpl.presentation_line || 'Awarded to recipient'}
                          </p>
                        </div>

                        {/* Gold Starburst Badge */}
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-amber-950 shadow-xs"
                          style={{ background: 'radial-gradient(circle, #fef08a, #f59e0b)' }}
                        >
                          ★
                        </div>
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

                    <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-sky-600 transition-colors flex items-center justify-between">
                      <span>{tpl.name}</span>
                      {isLocked && <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tpl.purpose || tpl.description || 'Purpose-built certificate format'}
                    </p>
                  </div>

                  {/* Footer Action */}
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
                    
                    {isLocked ? (
                      <span className="font-bold text-amber-600 flex items-center gap-1 text-[11px]">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(tpl, true);
                        }}
                        className="font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        Select & Continue →
                      </button>
                    )}

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
              Next: {issuanceMode === 'bulk' ? 'Upload Excel & Details' : 'Branding & Credentials'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: DETAILS & CREDENTIALS (SINGLE OR BULK EXCEL UPLOAD)
          ========================================================================= */}
      {step === 2 && selectedTemplate && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Selected Template Banner */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: selectedColorTheme.primary }}
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
                  {selectedTemplate.is_private && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </span>
                  )}
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

              {/* =========================================================================
                  BULK EXCEL UPLOAD SECTION (WHEN BULK MODE IS ACTIVE)
                  ========================================================================= */}
              {issuanceMode === 'bulk' && (
                <Card className="border-sky-300 bg-sky-50/30 shadow-xs">
                  <CardHeader className="pb-3 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        Upload Student Excel / CSV Spreadsheet
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Upload your spreadsheet. CertiGen will generate all certificates into a single ZIP file and email each student.
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadSampleExcel}
                      className="text-xs font-bold gap-1.5 border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 shrink-0"
                    >
                      <DownloadCloud className="w-3.5 h-3.5 text-emerald-600" />
                      Download Sample Excel (.xlsx)
                    </Button>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Drag & Drop File Input */}
                    <div 
                      onClick={() => excelFileInputRef.current?.click()}
                      className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer bg-white transition-all hover:bg-sky-50/50"
                    >
                      <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">
                        {excelFileName ? `Selected: ${excelFileName}` : 'Click or Drag & Drop Excel / CSV Sheet'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Supports .xlsx, .xls, and .csv files. Columns: recipient_name, recipient_email, achievement, rank, etc.
                      </p>

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadDemoStudents();
                          }}
                          className="text-xs font-bold text-sky-700 bg-sky-50 border-sky-300 hover:bg-sky-100 gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Load 4 Demo Students Instantly
                        </Button>
                      </div>

                      <input
                        ref={excelFileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelFileUpload}
                        className="hidden"
                      />
                    </div>


                    {validationErrors.excelFile && (
                      <p className="text-xs text-red-500 font-semibold">{validationErrors.excelFile}</p>
                    )}

                    {/* Email Dispatch Automation Checkbox */}
                    <div className="p-3.5 bg-white rounded-xl border border-sky-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <label htmlFor="send-emails-check" className="text-xs font-bold text-slate-900 cursor-pointer block">
                            Automatic Email Dispatch to Each Student
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Attaches each recipient's high-resolution certificate PDF with direct verification links.
                          </p>
                        </div>
                      </div>

                      <input
                        id="send-emails-check"
                        type="checkbox"
                        checked={sendEmails}
                        onChange={(e) => setSendEmails(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </div>

                    {/* Parsed Recipients Preview Table */}
                    {parsedRecipients.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              Detected Recipients:
                            </span>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs">
                              <Users className="w-3 h-3 mr-1" /> {parsedRecipients.length} Students Ready
                            </Badge>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddEmptyRecipient}
                            className="text-xs text-sky-600 font-bold gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Student
                          </Button>
                        </div>

                        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 sticky top-0 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">#</th>
                                <th className="p-2.5">Student Full Name</th>
                                <th className="p-2.5">Email Address</th>
                                <th className="p-2.5">Achievement / Rank</th>
                                <th className="p-2.5 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {parsedRecipients.map((rec, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80">
                                  <td className="p-2.5 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                                  <td className="p-2.5 font-bold text-slate-800">{rec.recipient_name}</td>
                                  <td className="p-2.5 font-mono text-slate-600">{rec.recipient_email || '—'}</td>
                                  <td className="p-2.5 text-slate-600">
                                    {rec.achievement || achievement || 'Distinction'}
                                    {rec.rank ? ` (${rec.rank})` : ''}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRecipient(idx)}
                                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                      title="Remove recipient"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* =========================================================================
                  SINGLE RECIPIENT INFORMATION (WHEN SINGLE MODE IS ACTIVE)
                  ========================================================================= */}
              {issuanceMode === 'single' && (
                <Card className="border-slate-200/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                      <User className="w-4 h-4 text-emerald-600" />
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
              )}

              {/* STORE COLOR THEME SELECTOR */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <Palette className="w-4 h-4 text-pink-600" />
                    {issuanceMode === 'bulk' ? '1.' : '2.'} Certificate Color Scheme (Normal Store Quality)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose an authentic stationery colorway for borders, titles, filigrees, and seals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STORE_COLOR_THEMES.map(theme => {
                      const isThemeSelected = selectedColorTheme.id === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setSelectedColorTheme(theme)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isThemeSelected 
                              ? 'border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className="w-4 h-4 rounded-full border shadow-2xs" 
                              style={{ backgroundColor: theme.primary }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border shadow-2xs" 
                              style={{ backgroundColor: theme.secondary }} 
                            />
                            <span 
                              className="w-4 h-4 rounded-full border shadow-2xs" 
                              style={{ backgroundColor: theme.accent }} 
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{theme.label}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{theme.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* INSTITUTE / COMPANY LOGO PICKER */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <Building className="w-4 h-4 text-sky-600" />
                    {issuanceMode === 'bulk' ? '2.' : '3.'} Institute or Company Logo
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Add your university, college, company, or organization crest to the top of the certificate.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 block mb-2">
                      Choose Preset Institute Crest:
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PRESET_INSTITUTE_LOGOS.map(logo => {
                        const isLogoSelected = selectedInstituteLogo === logo.svgDataUri;
                        return (
                          <div
                            key={logo.id}
                            onClick={() => {
                              setSelectedInstituteLogo(logo.svgDataUri);
                              setCustomLogoFileName('');
                            }}
                            className={`p-2.5 rounded-xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                              isLogoSelected
                                ? 'border-sky-600 bg-sky-50 shadow-xs ring-1 ring-sky-400'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <img src={logo.svgDataUri} alt={logo.name} className="w-10 h-10 object-contain drop-shadow-xs" />
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1 leading-tight">
                              {logo.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Upload */}
                  <div className="pt-2 border-t border-slate-100">
                    <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Or Upload Custom College / Company Logo (PNG, JPG, SVG):
                    </Label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-xl bg-sky-50/50 hover:bg-sky-50 cursor-pointer text-xs font-bold text-sky-700 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>{customLogoFileName ? 'Replace Logo File' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>

                      {customLogoFileName && (
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                          <img src={selectedInstituteLogo} alt="Preview" className="w-6 h-6 object-contain rounded" />
                          <span className="font-semibold text-slate-700 truncate max-w-[150px]">{customLogoFileName}</span>
                          <button
                            onClick={() => {
                              setCustomLogoFileName('');
                              setSelectedInstituteLogo(PRESET_INSTITUTE_LOGOS[0].svgDataUri);
                            }}
                            className="text-slate-400 hover:text-red-500 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event & Organization */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <Building className="w-4 h-4 text-indigo-600" />
                    {issuanceMode === 'bulk' ? '3.' : '4.'} Event, Course & Organization Information
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
                        placeholder="e.g. ABC Institute of Technology"
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

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Primary Achievement Title / Honor (Default for batch)
                    </Label>
                    <Input
                      value={achievement}
                      onChange={e => setAchievement(e.target.value)}
                      placeholder="e.g. First Place / Outstanding Achievement"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Department / Accreditation Subtitle (Optional)
                    </Label>
                    <Input
                      value={instituteSubtitle}
                      onChange={e => setInstituteSubtitle(e.target.value)}
                      placeholder="e.g. Accredited Verification Authority & Academic Standards"
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dual Signatures */}
              <Card className="border-slate-200/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    {issuanceMode === 'bulk' ? '4.' : '5.'} Dual Authorized Signatories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Primary Signatory Name
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
                        Primary Signatory Title
                      </Label>
                      <Input
                        value={signatoryTitle}
                        onChange={e => setSignatoryTitle(e.target.value)}
                        placeholder="e.g. Dean of Academic Affairs"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Second Signatory Name (Director / Principal)
                      </Label>
                      <Input
                        value={secondSignatoryName}
                        onChange={e => setSecondSignatoryName(e.target.value)}
                        placeholder="e.g. Prof. Vikram Singh"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-700">
                        Second Signatory Title
                      </Label>
                      <Input
                        value={secondSignatoryTitle}
                        onChange={e => setSecondSignatoryTitle(e.target.value)}
                        placeholder="e.g. Director of Certification"
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
                  {issuanceMode === 'bulk' ? `Preview Batch (${parsedRecipients.length} Students)` : 'Preview Store Certificate'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dynamic Interpolation Preview Card */}
            <div className="space-y-4">
              <Card className="border-slate-200/80 shadow-xs sticky top-20 bg-slate-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Dynamic Interpolation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {issuanceMode === 'bulk' 
                      ? 'Sample preview based on 1st student in spreadsheet:'
                      : 'How the template wording renders with your input:'}
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
                      Sample Recipient Name:
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

                  {issuanceMode === 'bulk' ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900">
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        <FileArchive className="w-4 h-4 text-emerald-600" />
                        <span>Bulk Generation Summary</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        • {parsedRecipients.length} certificates will be compiled into 1 ZIP file.
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        • {sendEmails ? 'Emails will be sent to all valid email addresses.' : 'Email sending is currently disabled.'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ReportLab vector PDF will render with high-res typography & QR code.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: LIVE STORE CERTIFICATE PREVIEW & ISSUE ACTION
          ========================================================================= */}
      {step === 3 && selectedTemplate && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                3. Live Certificate Preview & Issuance
              </h2>
              <p className="text-xs text-slate-500">
                {issuanceMode === 'bulk'
                  ? `Showing live preview for 1st recipient (${recipientName}). ${parsedRecipients.length} certificates will be created and bundled into a ZIP file.`
                  : 'Verify the rendered certificate layout, ornate borders, gold seal, and scan the real-time QR code.'}
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
                onClick={handleIssueAction}
                disabled={loading}
                className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{issuanceMode === 'bulk' ? `Generating ${parsedRecipients.length} Certificates & ZIP...` : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    {issuanceMode === 'bulk' ? <FileArchive className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                    <span>{issuanceMode === 'bulk' ? `Generate ${parsedRecipients.length} Certificates & ZIP` : 'Generate & Issue Certificate'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* REALISTIC STORE CERTIFICATE CANVAS */}
          <div className="overflow-x-auto p-1 bg-slate-100/60 rounded-3xl border border-slate-200 shadow-inner">
            <StoreCertificateFrame
              titlePrefix={selectedTemplate.title_prefix || 'CERTIFICATE OF'}
              subtitle={selectedTemplate.subtitle || 'ACHIEVEMENT'}
              presentationLine={selectedTemplate.presentation_line || 'This is proudly presented to'}
              recipientName={recipientName}
              resolvedWording={resolvedWording}
              badgeText={selectedTemplate.badge_text || 'EXCELLENCE AWARD'}
              organizationName={organization}
              instituteSubtitle={instituteSubtitle}
              primaryColor={selectedColorTheme.primary}
              secondaryColor={selectedColorTheme.secondary}
              accentColor={selectedColorTheme.accent}
              certificateNumber={certificateNumber}
              issueDate={issueDate}
              signatoryName={signatoryName}
              signatoryTitle={signatoryTitle}
              secondSignatoryName={secondSignatoryName}
              secondSignatoryTitle={secondSignatoryTitle}
              qrDataUrl={previewQrUrl}
              instituteLogoUrl={selectedInstituteLogo}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          BULK ISSUANCE SUCCESS MODAL (WITH ONE-CLICK ZIP DOWNLOAD & EMAIL REPORT)
          ========================================================================= */}
      {bulkBatchResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-center space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <FileArchive className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-2">
                ✓ Batch Issuance Complete
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                All Certificates Generated!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Successfully generated <strong>{bulkBatchResult.total_issued} certificates</strong> packaged inside one ZIP file.
              </p>
            </div>

            {/* Email dispatch report */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certificates Created</span>
                <span className="text-xl font-black text-slate-900">{bulkBatchResult.total_issued}</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Emails Dispatched</span>
                <span className="text-xl font-black text-sky-700">{bulkBatchResult.emails_sent}</span>
              </div>
            </div>

            {/* Primary Action: Download All Certificates (ZIP) */}
            <div className="pt-1">
              <Button
                onClick={handleDownloadBatchZip}
                disabled={downloadingZip}
                className="w-full h-12 text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-600/25"
              >
                {downloadingZip ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download All Certificates (.ZIP) 📦
              </Button>
              <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
                Archive: {bulkBatchResult.zip_filename}
              </p>
            </div>

            {/* Issued Certificates Table Preview */}
            <div className="text-left space-y-1.5 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Issued Certificates Ledger:
              </span>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-1 text-xs">
                {bulkBatchResult.certificates.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-800">{c.recipient_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono ml-2">({c.certificate_number})</span>
                    </div>
                    <a
                      href={`/verify/${c.certificate_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBulkBatchResult(null);
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
                  setBulkBatchResult(null);
                  setParsedRecipients([]);
                  setExcelFileName('');
                  setStep(1);
                  fetchNextId();
                }}
                className="text-xs text-sky-600 font-bold"
              >
                + Issue Another Batch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SINGLE CERTIFICATE SUCCESS MODAL
          ========================================================================= */}
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
                <strong>{templateToUnlock?.name}</strong> is a restricted private template. Enter the passcode set by the Administrator to proceed with issuance.
              </DialogDescription>
            </DialogHeader>

            {unlockError && (
              <div className="my-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{unlockError}</span>
              </div>
            )}

            <div className="py-3 space-y-2">
              <Label htmlFor="create-passcode-input" className="text-xs font-semibold text-slate-700">
                Template Access Passcode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-passcode-input"
                type="password"
                placeholder="Enter access passcode..."
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                autoFocus
                className="text-sm font-mono tracking-wider"
              />
              <p className="text-[11px] text-slate-400">
                Contact an Administrator if you have not been granted authorization.
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
                Unlock & Proceed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}