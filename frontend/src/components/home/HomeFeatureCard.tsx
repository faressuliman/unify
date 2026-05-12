import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useLanguage } from "../../context/LanguageContext";

interface HomeFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isMobile?: boolean;
  animationDelay?: number;
  currentIndex?: number;
  totalCards?: number;
  onDotClick?: (index: number) => void;
}

const HomeFeatureCard = memo(function HomeFeatureCard({
  icon: Icon,
  title,
  description,
  isMobile = false,
  animationDelay = 0,
  currentIndex,
  totalCards = 3,
  onDotClick,
}: HomeFeatureCardProps) {
  const { language } = useLanguage();

  const cardContent = (
    <div
      className={`relative z-10 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${
        isMobile
          ? "p-6 pb-8 h-82 flex flex-col items-center text-center"
          : "p-4 sm:p-6 md:p-4 lg:p-8 h-full flex flex-col items-center text-center"
      }`}
    >
      <div className="mb-4 sm:mb-6 md:mb-3 lg:mb-6 flex items-center justify-center w-full">
        <div className="p-4 rounded-full bg-primary inline-flex items-center justify-center transition-colors duration-300 text-secondary">
          <Icon className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3 md:mb-2 lg:mb-3">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl sm:text-lg md:text-base lg:text-xl font-bold text-slate-900"
        >
          {title}
        </motion.h3>
      </div>
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className={`text-slate-500 leading-relaxed ${
          isMobile
            ? "text-xs mb-4 flex-1"
            : "text-xs sm:text-sm md:text-xs lg:text-sm flex-1"
        }`}
      >
        {description}
      </motion.p>

      {/* Dots Indicator - Only for mobile */}
      {isMobile && currentIndex !== undefined && totalCards && onDotClick && (
        <div
          className={`flex justify-center gap-2 mt-auto pt-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
        >
          {Array.from({ length: totalCards }).map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-secondary w-6" : "bg-slate-200 w-2"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return <div className="w-full shrink-0 px-2 lg:px-4">{cardContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: animationDelay }}
      className="h-full"
    >
      {cardContent}
    </motion.div>
  );
});

export default HomeFeatureCard;
