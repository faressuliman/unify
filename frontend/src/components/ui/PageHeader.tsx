import { Home, ChevronRight, ChevronLeft, ArrowDownRight, ArrowDownLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  navigatedTo?: string;
  parentName?: string;
  parentHref?: string;
  parentIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  showArrow?: boolean;
  className?: string;
  titleClassName?: string;
}

export default function PageHeader({ navigatedTo, parentName, parentHref, parentIcon, title, subtitle, showArrow, className = "mb-8 w-full max-w-400 mx-auto px-6 lg:px-12", titleClassName = '' }: PageHeaderProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={className}>
      {navigatedTo && (
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm mb-4">
          <a href={parentHref || "/"} className="text-slate-500 hover:text-secondary flex items-center gap-1 transition-colors">
            {parentIcon ? parentIcon : ((!parentName || parentHref === "/") && <Home className="w-4 h-4" />)}
            <span>{parentName || (isRTL ? 'الرئيسية' : 'Home')}</span>
          </a>
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-secondary font-medium">{navigatedTo}</span>
        </nav>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-start gap-1"
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-extrabold text-tertiary uppercase leading-tight whitespace-nowrap ${isRTL ? 'tracking-normal' : 'tracking-widest'} ${titleClassName}`}>
            {title}
          </h1>
          {showArrow && (
            !isRTL ? (
                <ArrowDownRight className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:translate-x-1 hover:translate-y-1" />
            ) : (
                <ArrowDownLeft className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:-translate-x-1 hover:translate-y-1" />
            )
          )}
        </div>
        <p className="text-gray-500 mt-1 text-sm max-w-2xl text-start">
          {subtitle}
        </p>
      </motion.div>
    </div>
  );
}