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
      className={`rounded-lg border border-primary/40 bg-primary/20 text-secondary p-4 flex items-start gap-3 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="text-sm text-slate-700 leading-relaxed">
        {title ? (
          <span className="font-semibold text-slate-800 me-1">{title}</span>
        ) : null}
        <span>{message}</span>
      </div>
    </div>
  );
}