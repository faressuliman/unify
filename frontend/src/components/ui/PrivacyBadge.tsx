import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacyBadge() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className="mt-8 rounded-xl bg-slate-100/50 p-4 sm:p-5 border border-slate-200">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex shrink-0 bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-slate-100">
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                    </div>
                    <h4 className="text-sm font-bold text-tertiary">
                        {isRTL ? 'خصوصيتك محمية' : 'Your Privacy is Protected'}
                    </h4>
                </div>
                <div className="text-start">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {isRTL 
                            ? 'نحن نتبع أعلى معايير الأمان والتشفير. لن يتم عرض معلوماتك الحساسة علناً.'
                            : 'We use industry-standard encryption to protect your sensitive data. Your information is never shared publicly.'}
                    </p>
                </div>
            </div>
        </div>
    );
}