import React from 'react';

interface CertigenLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function CertigenLogo({ className = '', size = 'md', showText = false }: CertigenLogoProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img 
        src="/favicon.svg" 
        alt="CertiGen Logo" 
        className={`${sizeMap[size]} shrink-0 drop-shadow-sm`} 
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1 font-serif">
            Certi<span className="text-sky-600">Gen</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
            Verified Studio
          </span>
        </div>
      )}
    </div>
  );
}
