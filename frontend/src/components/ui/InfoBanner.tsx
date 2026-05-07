import type { ReactNode } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface InfoBannerProps {
  icon: ReactNode;
  title?: string;
  message: string;
  className?: string;
}

export default function InfoBanner({ icon, title, message, className = '' }: InfoBannerProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div
      className={`rounded-lg border border-primary/40 bg-primary/20 p-4 flex items-center gap-3 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 border border-primary/20 text-secondary shrink-0">
        {icon}
      </div>
      <div className="flex-1 text-sm text-slate-700 leading-relaxed flex items-center text-start">
        {title ? (
          <span className="font-semibold text-slate-800 me-1">{title}</span>
        ) : null}
        <span>{message}</span>
      </div>
    </div>
  );
}
