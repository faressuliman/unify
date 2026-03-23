import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";
import { AlertCircle, Home } from "lucide-react";
import { useRouteError, useNavigate } from "react-router-dom";

export default function ErrorFallback() {
  const { language } = useLanguage();
  const error: any = useRouteError();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white overflow-hidden"
    >
      {/* Subtle Ambient Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-red-50 via-white to-white opacity-80" />

      {/* Main Error Container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center p-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center w-32 h-32 text-red-500"
        >
          {/* Outer Ripple Effect */}
          <motion.div
            className="absolute inset-0 rounded-full border border-red-500/30 bg-red-500/5"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <AlertCircle className="w-20 h-20 relative z-10 drop-shadow-lg" />
        </motion.div>

        {/* Typography */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'}
          </h2>
          <p className="text-gray-500 mb-6">
            {error?.message || (language === 'ar' ? 'نعتذر عن هذا الخلل. يرجى المحاولة مرة أخرى لاحقاً.' : 'We apologize for the inconvenience. Please try again later.')}
          </p>

          <button
            onClick={handleGoHome}
             className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white font-medium hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            <span>{language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Go to Home Page'}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
