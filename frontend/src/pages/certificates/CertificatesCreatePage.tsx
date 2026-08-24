import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye, 
  Check, 
  AlertCircle,
  FolderOpen,
  Award
} from 'lucide-react';
import { templatesService } from '@/services/templates.service';
import { certificatesService } from '@/services/certificates.service';
import type { Template } from '@/types';

interface CustomField {
  key: string;
  value: string;
}

export function CertificatesCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Wizard Step
  const [step, setStep] = useState(1); // 1: Select Template, 2: Enter Details, 3: Preview

  // Form Fields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [certificateType, setCertificateType] = useState('Achievement');
  const [eventName, setEventName] = useState('');
  const [achievement, setAchievement] = useState('Successful Completion');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [organization, setOrganization] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Form Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-generate certificate number
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCertificateNumber(`CERT-2026-${rand}`);
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setDataLoading(true);
    try {
      const response = await templatesService.getAll();
      // Only show active templates
      const activeTemplates = (response.results || []).filter(t => t.is_active);
      setTemplates(activeTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8000${url}`;
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Dynamic fields handlers
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...customFields];
    updated[index][field] = val;
    setCustomFields(updated);
  };

  // Form validation
  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (!recipientName.trim()) errors.recipientName = 'Recipient Name is required';
    if (!recipientEmail.trim()) {
      errors.recipientEmail = 'Recipient Email is required';
    } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      errors.recipientEmail = 'Invalid Email address';
    }
    if (!certificateType.trim()) errors.certificateType = 'Certificate Type is required';
    if (!eventName.trim()) errors.eventName = 'Event Name is required';
    if (!achievement.trim()) errors.achievement = 'Achievement is required';
    if (!issueDate) errors.issueDate = 'Issue date is required';
    if (!organization.trim()) errors.organization = 'Organization name is required';
    if (!certificateNumber.trim()) errors.certificateNumber = 'Certificate number is required';

    // Validate custom fields
    customFields.forEach((cf, i) => {
      if (!cf.key.trim() && cf.value.trim()) {
        errors[`custom_key_${i}`] = 'Label name cannot be empty';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedTemplateId) {
        setError('Please select a template first');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (validateDetails()) {
        setError(null);
        setStep(3);
      } else {
        setError('Please fix form validation errors.');
      }
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    // Format fields
    const title = `${certificateType} - ${eventName}`;
    
    // Compile description & custom fields into a structured text
    let descriptionText = `Awarded to ${recipientName} for ${achievement} in the event "${eventName}".\n\n`;
    descriptionText += `Issued by: ${organization}\n`;
    descriptionText += `Issue Date: ${new Date(issueDate).toLocaleDateString()}\n`;
    
    if (customFields.length > 0) {
      descriptionText += `\nAdditional Details:\n`;
      customFields.forEach(cf => {
        if (cf.key.trim()) {
          descriptionText += `- ${cf.key.trim()}: ${cf.value.trim()}\n`;
        }
      });
    }

    const payload = {
      certificate_number: certificateNumber,
      title: title,
      description: descriptionText,
      template: selectedTemplateId,
      recipient_name: recipientName,
      recipient_email: recipientEmail
    };

    try {
      await certificatesService.create(payload);
      navigate('/certificates');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to generate certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Steps indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Certificate</h2>
          <p className="text-slate-500">Select template, enter details, and generate digital certificate</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
            step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}>1</div>
          <span className={`text-sm font-medium ${step === 1 ? 'text-sky-600' : 'text-slate-500'}`}>Select Template</span>
        </div>
        <div className="h-px bg-slate-200 grow mx-4" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
            step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}>2</div>
          <span className={`text-sm font-medium ${step === 2 ? 'text-sky-600' : 'text-slate-500'}`}>Enter Details</span>
        </div>
        <div className="h-px bg-slate-200 grow mx-4" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
            step >= 3 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}>3</div>
          <span className={`text-sm font-medium ${step === 3 ? 'text-sky-600' : 'text-slate-500'}`}>Preview & Issue</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT TEMPLATE */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Choose Design Layout</CardTitle>
            <CardDescription>Select an active background layout template to represent the certificate design.</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`cursor-pointer group relative rounded-xl border-2 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                      selectedTemplateId === template.id
                        ? 'border-sky-600 ring-2 ring-sky-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="h-40 bg-slate-100 relative overflow-hidden border-b flex items-center justify-center">
                      {template.image_url ? (
                        <img
                          src={getImageUrl(template.image_url)}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileCheck className="h-16 w-16 text-slate-300" />
                      )}

                      {selectedTemplateId === template.id && (
                        <div className="absolute inset-0 bg-sky-600/10 flex items-center justify-center">
                          <div className="bg-sky-600 text-white rounded-full p-1.5 shadow-md">
                            <Check className="w-5 h-5 font-bold" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1 text-slate-400 text-xs">
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Category Layout</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{template.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {templates.length === 0 && !dataLoading && (
              <div className="text-center py-16 border rounded-2xl border-dashed">
                <FileCheck className="mx-auto h-16 w-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No active templates</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                  Before issuing a certificate, please make sure an Admin has created and activated at least one template.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t mt-6">
              <Button onClick={handleNextStep} disabled={!selectedTemplateId}>
                Next: Enter Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: ENTER DETAILS */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Certificate Details</CardTitle>
            <CardDescription>Enter details about the award recipient and specific event metadata.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Recipient Details */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-sky-600 rounded-full" />
                  Recipient Info
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      placeholder="e.g. Alice Smith"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                    {validationErrors.recipientName && (
                      <p className="text-xs text-red-500">{validationErrors.recipientName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="recipientEmail">Recipient Email *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="e.g. alice@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                    {validationErrors.recipientEmail && (
                      <p className="text-xs text-red-500">{validationErrors.recipientEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Award Details */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-sky-600 rounded-full" />
                  Certificate Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="certificateType">Certificate Type *</Label>
                    <Input
                      id="certificateType"
                      placeholder="e.g. Certificate of Achievement, Participation"
                      value={certificateType}
                      onChange={(e) => setCertificateType(e.target.value)}
                    />
                    {validationErrors.certificateType && (
                      <p className="text-xs text-red-500">{validationErrors.certificateType}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eventName">Event / Course Name *</Label>
                    <Input
                      id="eventName"
                      placeholder="e.g. Django Developer Bootcamp"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                    {validationErrors.eventName && (
                      <p className="text-xs text-red-500">{validationErrors.eventName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="achievement">Achievement *</Label>
                    <Input
                      id="achievement"
                      placeholder="e.g. Successful Completion, First Place"
                      value={achievement}
                      onChange={(e) => setAchievement(e.target.value)}
                    />
                    {validationErrors.achievement && (
                      <p className="text-xs text-red-500">{validationErrors.achievement}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="organization">Issuing Organization *</Label>
                    <Input
                      id="organization"
                      placeholder="e.g. CertiGen Academy"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                    {validationErrors.organization && (
                      <p className="text-xs text-red-500">{validationErrors.organization}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                    {validationErrors.issueDate && (
                      <p className="text-xs text-red-500">{validationErrors.issueDate}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="certificateNumber">Certificate Serial Number *</Label>
                    <Input
                      id="certificateNumber"
                      placeholder="Auto-generated or custom serial"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                    />
                    {validationErrors.certificateNumber && (
                      <p className="text-xs text-red-500">{validationErrors.certificateNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Metadata Fields */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full" />
                    Dynamic Extra Fields (Optional)
                  </h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-sky-600 border-sky-100 hover:bg-sky-50"
                    onClick={handleAddCustomField}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
                  </Button>
                </div>

                <div className="space-y-3">
                  {customFields.map((cf, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="grow grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">Label (e.g. Grade, Advisor)</Label>
                          <Input
                            placeholder="Label name"
                            value={cf.key}
                            onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                          />
                          {validationErrors[`custom_key_${index}`] && (
                            <p className="text-xs text-red-500">{validationErrors[`custom_key_${index}`]}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500">Value (e.g. Grade A+, John Connor)</Label>
                          <Input
                            placeholder="Value details"
                            value={cf.value}
                            onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveCustomField(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {customFields.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No custom metadata tags added.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back: Select Template
              </Button>
              <Button type="button" onClick={handleNextStep}>
                Next: Preview Layout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: PREVIEW & GENERATE */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Verification & Certificate Preview</CardTitle>
            <CardDescription>Verify overlay positioning and metadata fields before generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live Certificate Representation */}
            <div className="relative border rounded-2xl overflow-hidden aspect-[1.414/1] bg-white shadow-xl flex items-center justify-center p-8 max-w-2xl mx-auto border-slate-200">
              {/* Background Image Representation */}
              {selectedTemplate?.image_url ? (
                <img
                  src={getImageUrl(selectedTemplate.image_url)}
                  alt="Certificate Template"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-50 border border-slate-100 flex items-center justify-center opacity-30 select-none pointer-events-none">
                  <Award className="w-32 h-32 text-slate-300" />
                </div>
              )}

              {/* Styled Certificate text layer */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between items-center text-center py-6 px-10 text-slate-800">
                {/* Organization */}
                <div className="text-sm font-semibold tracking-wider uppercase text-slate-500">
                  {organization}
                </div>

                <div className="space-y-3 my-auto">
                  {/* Title of Certificate */}
                  <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-sky-850">
                    {certificateType}
                  </h1>

                  <div className="text-xs text-slate-500 font-medium italic">
                    This certificate is proudly presented to
                  </div>

                  {/* Recipient Name */}
                  <div className="text-3xl md:text-4xl font-serif italic font-bold text-slate-900 border-b border-slate-300 pb-2 px-8 min-w-[200px]">
                    {recipientName}
                  </div>

                  {/* Description text */}
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    For <span className="font-semibold text-slate-800">{achievement}</span> in the <span className="font-semibold text-slate-800">{eventName}</span>.
                  </p>
                </div>

                {/* Footer Metadata row */}
                <div className="w-full flex justify-between items-end border-t border-slate-100 pt-4 text-[10px] text-slate-400">
                  <div className="text-left">
                    <span className="block font-medium">Issue Date:</span>
                    <span className="text-slate-600 font-semibold">{new Date(issueDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Extra fields previews in bottom center */}
                  {customFields.length > 0 && (
                    <div className="text-center max-w-[200px] border-x px-3">
                      {customFields.slice(0, 2).map((cf, i) => (
                        <div key={i} className="line-clamp-1">
                          <span className="font-medium text-slate-400">{cf.key}: </span>
                          <span className="text-slate-600 font-semibold">{cf.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-right">
                    <span className="block font-medium">Serial No:</span>
                    <span className="text-slate-600 font-semibold">{certificateNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-sky-800 text-sm flex gap-3">
              <Award className="w-5 h-5 shrink-0 mt-0.5 text-sky-600" />
              <div>
                <span className="font-semibold block">Ready to Generate</span>
                <span>Generating this certificate will issue it to the recipient and log it on the secure ledger. An email notification will be queued automatically.</span>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back: Edit Details
              </Button>
              <Button 
                type="button" 
                onClick={handleGenerate}
                isLoading={loading}
                disabled={loading}
              >
                Generate Certificate
                <Award className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}