import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { certificatesService } from '@/services/certificates.service';
import type { VerificationResponse } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  QrCode, 
  Camera, 
  Download, 
  Share2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';

export function VerifyPage() {
  const { certificate_id } = useParams<{ certificate_id?: string }>();
  const [certInput, setCertInput] = useState(certificate_id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // QR Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Auto-verify if certificate_id parameter is in URL
  useEffect(() => {
    if (certificate_id) {
      setCertInput(certificate_id);
      handleVerify(certificate_id);
    }
  }, [certificate_id]);

  const handleVerify = async (idToVerify?: string) => {
    const id = (idToVerify || certInput).trim();
    if (!id) {
      setError('Please enter a Certificate ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Extract Certificate ID if full URL was pasted or scanned
      let cleanId = id;
      if (id.includes('/verify/')) {
        cleanId = id.split('/verify/')[1].split('/')[0].split('?')[0];
      }

      const data = await certificatesService.verify(cleanId);
      setResult(data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Certificate not found or invalid.';
      setError(msg);
      setResult({
        valid: false,
        status: 'NOT_FOUND',
        verified_at: new Date().toISOString(),
        error: msg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  // Toggle Camera QR Scanner
  const startScanner = async () => {
    setIsScannerOpen(true);
    setScannerError(null);

    // Short timeout to let the modal element mount
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader-container');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Found QR code
            stopScanner();
            let parsedId = decodedText;
            if (decodedText.includes('/verify/')) {
              parsedId = decodedText.split('/verify/')[1].split('/')[0].split('?')[0];
            }
            setCertInput(parsedId);
            handleVerify(parsedId);
          },
          () => {
            // Frame scan failure (ignore continuous frame scans)
          }
        );
      } catch (err: any) {
        console.error('Failed to start camera scanner:', err);
        setScannerError('Could not open camera. Please ensure camera permissions are granted.');
      }
    }, 200);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsScannerOpen(false);
    setScannerError(null);
  };

  // File QR code scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container-hidden');
      const decoded = await html5QrCode.scanFile(file, true);
      let parsedId = decoded;
      if (decoded.includes('/verify/')) {
        parsedId = decoded.split('/verify/')[1].split('/')[0].split('?')[0];
      }
      setCertInput(parsedId);
      handleVerify(parsedId);
      stopScanner();
    } catch (err) {
      alert('Could not detect a valid QR code in the uploaded image.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.certificate?.id) return;
    try {
      setDownloading(true);
      await certificatesService.downloadPdf(
        result.certificate.id,
        `${result.certificate.certificate_number}.pdf`
      );
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not download PDF certificate.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Public Header / Navigation */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-sky-600/20">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">CertiGen</h1>
              <span className="text-xs text-slate-500">Public Credential Verification Portal</span>
            </div>
          </div>
          <Link to="/login">
            <Button variant="outline" size="sm" className="text-xs font-medium">
              Issuer Login
            </Button>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cryptographically Verifiable Ledger
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Verify Certificate
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Confirm the authenticity, issuance details, and current validity status of any CertiGen digital certificate.
          </p>
        </div>

        {/* Verification Input Box */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Certificate ID</CardTitle>
            <CardDescription>Enter the unique certificate serial or scan the certificate QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="e.g. CERT-2026-000001"
                  className="pl-11 pr-24 py-3.5 text-base sm:text-lg font-mono tracking-wider uppercase border-slate-300 focus-visible:ring-sky-500"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={startScanner}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 rounded-md transition-colors flex items-center gap-1.5"
                  title="Scan QR Code"
                >
                  <Camera className="w-4 h-4 text-sky-600" />
                  <span>Scan QR</span>
                </button>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="grow py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-md shadow-sky-600/20" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying Ledger...
                    </>
                  ) : (
                    'VERIFY'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* QR SCANNER MODAL */}
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <QrCode className="w-5 h-5 text-sky-600" />
                  <span>Scan Certificate QR</span>
                </div>
                <Button variant="ghost" size="sm" onClick={stopScanner}>
                  Close
                </Button>
              </div>

              {scannerError ? (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                  {scannerError}
                </div>
              ) : (
                <div id="qr-reader-container" className="overflow-hidden rounded-xl bg-slate-950 aspect-square w-full" />
              )}

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 mb-2">Or select a picture containing the QR code:</p>
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Upload Image File
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        )}
        <div id="qr-reader-container-hidden" className="hidden" />

        {/* VERIFICATION RESULT */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            {/* Status Hero Banner */}
            {result.valid && result.status === 'VALID' ? (
              /* VALID STATE */
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="grow">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-200/60 text-emerald-900 mb-1">
                    AUTHENTICATED
                  </div>
                  <h3 className="text-2xl font-black text-emerald-950">
                    ✓ Certificate Valid
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    This certificate is genuine, signed by an authorized mentor, and recorded on the CertiGen ledger.
                  </p>
                </div>
                <div className="shrink-0">
                  <Badge className="bg-emerald-600 text-white px-3 py-1 font-bold text-sm tracking-wider">
                    VALID
                  </Badge>
                </div>
              </div>
            ) : result.status === 'REVOKED' ? (
              /* REVOKED STATE */
              <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-300 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md">
                  <XCircle className="w-10 h-10" />
                </div>
                <div className="grow">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-red-200/60 text-red-900 mb-1">
                    REVOCATION NOTICE
                  </div>
                  <h3 className="text-2xl font-black text-red-950">
                    ✗ Certificate Revoked
                  </h3>
                  <p className="text-xs text-red-700 mt-1 font-medium">
                    This certificate was officially REVOKED by the issuing authority and is no longer recognized as valid.
                  </p>
                  {result.revocation_reason && (
                    <div className="mt-2 text-xs bg-red-100/70 p-2.5 rounded-lg border border-red-200 text-red-800">
                      <strong>Reason:</strong> {result.revocation_reason}
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <Badge variant="destructive" className="px-3 py-1 font-bold text-sm tracking-wider">
                    REVOKED
                  </Badge>
                </div>
              </div>
            ) : (
              /* NOT FOUND STATE */
              <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-amber-900">Certificate Not Found</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    No certificate matching ID <strong>{certInput}</strong> was located in the database. Please double check the ID or contact the issuing organization.
                  </p>
                </div>
              </div>
            )}

            {/* Certificate Metadata Details Grid */}
            {result.certificate && (
              <Card className="border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
                  <div className="font-mono text-sm font-semibold tracking-wider">
                    {result.certificate.certificate_number}
                  </div>
                  <Badge variant={result.valid ? 'success' : 'destructive'}>
                    {result.certificate.status}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Recipient
                      </span>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {result.certificate.recipient_name}
                      </p>
                      <p className="text-xs text-slate-500">{result.certificate.recipient_email}</p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Event / Course
                      </span>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {result.certificate.title}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Issued
                      </span>
                      <p className="text-base font-semibold text-slate-800 mt-1">
                        {formatDate(result.certificate.issued_at)}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Status
                      </span>
                      <p className={`text-base font-black mt-1 ${result.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.certificate.status}
                      </p>
                    </div>

                    {result.certificate.description && (
                      <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Description & Details
                        </span>
                        <p className="text-sm text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                          {result.certificate.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {result.valid && (
                        <Button
                          onClick={handleDownloadPdf}
                          disabled={downloading}
                          className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                        >
                          {downloading ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-1.5" />
                          )}
                          Download Official PDF
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="text-xs text-slate-700"
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        {copied ? 'Link Copied!' : 'Share Verification Link'}
                      </Button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Verified at: {new Date(result.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
