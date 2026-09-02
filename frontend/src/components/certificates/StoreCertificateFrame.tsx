import React from 'react';
import { Award, QrCode } from 'lucide-react';

export interface StoreCertificateFrameProps {
  titlePrefix?: string;
  subtitle?: string;
  presentationLine?: string;
  recipientName?: string;
  resolvedWording?: string;
  badgeText?: string;
  organizationName?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  secondSignatoryName?: string;
  secondSignatoryTitle?: string;
  issueDate?: string;
  certificateNumber?: string;
  qrDataUrl?: string;
  instituteLogoUrl?: string;
  instituteSubtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  isInteractive?: boolean;
}

export function StoreCertificateFrame({
  titlePrefix = 'CERTIFICATE OF',
  subtitle = 'ACHIEVEMENT',
  presentationLine = 'This is proudly presented to',
  recipientName = 'MALLIKARJUN HIREMATH',
  resolvedWording = 'for outstanding achievement and distinguished excellence in Technical Innovation & Leadership',
  badgeText = 'OFFICIAL MERIT DISTINCTION',
  organizationName = 'ABC Institute of Technology',
  signatoryName = 'Dr. Rajesh Kumar',
  signatoryTitle = 'Dean of Academic Affairs',
  secondSignatoryName = 'Prof. Vikram Singh',
  secondSignatoryTitle = 'Program Director',
  issueDate = new Date().toISOString().split('T')[0],
  certificateNumber = 'CERT-2026-000001',
  qrDataUrl,
  instituteLogoUrl,
  instituteSubtitle = 'Department of Academic & Professional Excellence',
  primaryColor = '#0f2744',
  secondaryColor = '#c59b27',
  accentColor = '#e2d19f',
}: StoreCertificateFrameProps) {
  const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div 
      className="w-full bg-[#fdfdfe] rounded-2xl shadow-2xl relative p-6 sm:p-10 select-none overflow-hidden transition-all duration-300 border font-serif"
      style={{
        borderColor: primaryColor,
        borderWidth: '6px',
        backgroundColor: '#fdfdfe',
      }}
    >
      {/* Background Guilloché Watermark Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${primaryColor} 1.5px, transparent 1.5px), radial-gradient(circle at center, ${secondaryColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Middle Ornate Filigree Border */}
      <div 
        className="w-full h-full border-2 rounded-xl p-6 sm:p-8 relative flex flex-col justify-between items-center text-center z-10"
        style={{
          borderColor: secondaryColor,
          outline: `1px dashed ${accentColor}`,
          outlineOffset: '-6px'
        }}
      >
        {/* Ornate Vintage Corner Filigrees (Store Certificate Style) */}
        {/* Top-Left */}
        <div className="absolute top-2 left-2 w-10 h-10 pointer-events-none">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38V6C2 3.8 3.8 2 6 2H38" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 34V10C6 7.8 7.8 6 10 6H34" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="3.5" fill={secondaryColor} />
            <path d="M2 20C10 20 20 10 20 2" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Top-Right */}
        <div className="absolute top-2 right-2 w-10 h-10 pointer-events-none rotate-90">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38V6C2 3.8 3.8 2 6 2H38" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 34V10C6 7.8 7.8 6 10 6H34" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="3.5" fill={secondaryColor} />
            <path d="M2 20C10 20 20 10 20 2" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-2 left-2 w-10 h-10 pointer-events-none -rotate-90">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38V6C2 3.8 3.8 2 6 2H38" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 34V10C6 7.8 7.8 6 10 6H34" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="3.5" fill={secondaryColor} />
            <path d="M2 20C10 20 20 10 20 2" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-2 right-2 w-10 h-10 pointer-events-none rotate-180">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M2 38V6C2 3.8 3.8 2 6 2H38" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 34V10C6 7.8 7.8 6 10 6H34" stroke={accentColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="3.5" fill={secondaryColor} />
            <path d="M2 20C10 20 20 10 20 2" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* =========================================================================
            1. TOP SECTION: INSTITUTE / COMPANY LOGO & HEADER
            ========================================================================= */}
        <div className="flex flex-col items-center space-y-2 pt-1 max-w-xl">
          {/* Institute / Company Logo */}
          <div className="flex items-center justify-center mb-1">
            {instituteLogoUrl ? (
              <img 
                src={instituteLogoUrl} 
                alt="Institute Logo" 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <Award className="w-8 h-8 text-amber-300" />
              </div>
            )}
          </div>

          <span 
            className="text-xs sm:text-sm font-black tracking-widest uppercase font-sans"
            style={{ color: primaryColor }}
          >
            {organizationName}
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-sans tracking-wide">
            {instituteSubtitle}
          </span>

          <div 
            className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border mt-1 font-sans"
            style={{ 
              backgroundColor: `${secondaryColor}15`, 
              color: secondaryColor,
              borderColor: `${secondaryColor}40`
            }}
          >
            ★ {badgeText} ★
          </div>
        </div>

        {/* =========================================================================
            2. MAIN TITLE & SUBTITLE
            ========================================================================= */}
        <div className="my-3 space-y-1">
          <h2 
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight"
            style={{ color: primaryColor }}
          >
            {titlePrefix}
          </h2>
          <h3 
            className="text-xl sm:text-2xl font-bold uppercase tracking-widest"
            style={{ color: secondaryColor }}
          >
            {subtitle}
          </h3>

          {/* Symmetrical Ornamental Divider */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="w-16 sm:w-28 h-0.5" style={{ backgroundColor: secondaryColor }} />
            <div className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: secondaryColor }} />
            <div className="w-16 sm:w-28 h-0.5" style={{ backgroundColor: secondaryColor }} />
          </div>
        </div>

        {/* =========================================================================
            3. RECIPIENT & PRESENTATION
            ========================================================================= */}
        <div className="my-2 space-y-2 max-w-2xl">
          <p className="italic text-slate-600 text-sm sm:text-base">
            {presentationLine}
          </p>

          <div className="relative inline-block px-6 py-1">
            <h1 
              className="text-3xl sm:text-4xl font-extrabold tracking-wide text-slate-900 border-b-2 pb-1"
              style={{ borderColor: secondaryColor }}
            >
              {recipientName}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed px-4 pt-1">
            "{resolvedWording}"
          </p>
        </div>

        {/* =========================================================================
            4. AUTHENTIC GOLD STORE SEAL & QR CODE SECTION
            ========================================================================= */}
        <div className="w-full flex items-center justify-between px-4 sm:px-8 my-4">
          {/* Left: Authentic Gold Embossed Store Seal with Silk Ribbons */}
          <div className="flex flex-col items-center relative group">
            {/* Hanging Silk Ribbons */}
            <div className="absolute top-10 flex gap-2 pointer-events-none">
              <div 
                className="w-4 h-12 shadow-md clip-ribbon"
                style={{ 
                  backgroundColor: primaryColor,
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' 
                }}
              />
              <div 
                className="w-4 h-12 shadow-md clip-ribbon"
                style={{ 
                  backgroundColor: secondaryColor,
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' 
                }}
              />
            </div>

            {/* Gold Starburst Embossed Medal */}
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center p-2 text-center text-white shadow-xl relative z-10 border-2 border-yellow-200/80"
              style={{
                background: `radial-gradient(circle at 30% 30%, #fef08a 0%, #f59e0b 50%, #b45309 100%)`,
                boxShadow: `0 8px 16px -2px ${secondaryColor}60, inset 0 2px 4px rgba(255,255,255,0.8)`
              }}
            >
              <div className="w-full h-full rounded-full border border-yellow-100/60 border-dashed flex flex-col items-center justify-center p-1">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-yellow-950 font-sans">
                  OFFICIAL
                </span>
                <span className="text-[10px] sm:text-[11px] font-black text-white drop-shadow-sm leading-tight font-sans">
                  SEAL
                </span>
                <span className="text-[7px] sm:text-[8px] font-bold text-yellow-900 uppercase tracking-wider font-sans">
                  VERIFIED 2026
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Verification QR Code */}
          <div className="flex flex-col items-center">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-md">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Verification QR" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 flex items-center justify-center text-slate-400">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 font-sans">
              Scan to Verify
            </span>
            <span 
              className="text-xs sm:text-sm font-mono font-bold"
              style={{ color: primaryColor }}
            >
              {certificateNumber}
            </span>
          </div>
        </div>

        {/* =========================================================================
            5. FOOTER: DATE, ISSUER & DUAL AUTHENTIC SIGNATURES
            ========================================================================= */}
        <div className="w-full flex items-end justify-between pt-4 border-t border-slate-200/80 text-left">
          {/* Left Signatory / Details */}
          <div className="space-y-0.5">
            <div className="w-32 sm:w-40 border-b border-slate-400 mb-1.5" />
            <p 
              className="font-bold text-xs sm:text-sm"
              style={{ color: primaryColor }}
            >
              {signatoryName}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-sans">
              {signatoryTitle}
            </p>
            <p className="text-[9px] text-slate-400 font-sans pt-1">
              Issued On: {formattedDate}
            </p>
          </div>

          {/* Right Signatory (Director / President) */}
          <div className="text-right space-y-0.5">
            <div className="w-32 sm:w-40 border-b border-slate-400 ml-auto mb-1.5" />
            <p 
              className="font-bold text-xs sm:text-sm"
              style={{ color: primaryColor }}
            >
              {secondSignatoryName}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 font-sans">
              {secondSignatoryTitle}
            </p>
            <p className="text-[9px] font-mono text-slate-400 font-sans pt-1">
              Auth ID: {certificateNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
