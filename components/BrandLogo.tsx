import React from 'react';

interface BrandLogoProps {
  dark?: boolean;
  className?: string;
  horizontal?: boolean; // new prop to switch layout
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ dark = false, className = '', horizontal = false, showSubtitle = false }) => {
  const textColor = dark ? 'text-brand-snow' : 'text-brand-midnight';
  const subtitleColor = dark ? 'text-brand-gray-light' : 'text-brand-gray';

  const Symbol = () => (
    <svg width={horizontal ? "36" : "64"} height={horizontal ? "36" : "64"} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      {/* Simbolo Circuito VL */}
      <path d="M 20 48 L 32 20 L 40 40 L 52 40" stroke={dark ? '#F8FAFC' : '#0F172A'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="52" cy="40" r="4" fill="#F59E0B" />
    </svg>
  );

  const Wordmark = () => (
    <div className="flex flex-col">
      <div className={`font-mono text-3xl tracking-widest flex items-center ${textColor}`}>
        <span className="font-bold">VL</span>
        <span className="text-brand-amber font-bold mx-[2px] mt-1 text-4xl leading-none">.</span>
        <span className="font-light text-brand-gray tracking-widest">IA</span>
      </div>
      {showSubtitle && (
        <span className={`font-sans text-[10px] tracking-[0.2em] uppercase font-semibold mt-0.5 ml-1 leading-none ${subtitleColor}`}>
          AutoFix Pro
        </span>
      )}
    </div>
  );

  if (horizontal) {
    return (
      <div className={`flex flex-row items-center gap-3 ${className}`}>
        <Symbol />
        <Wordmark />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Symbol />
      <Wordmark />
    </div>
  );
};
