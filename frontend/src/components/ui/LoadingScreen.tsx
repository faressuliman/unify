import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import unifyLogo from "../../assets/unify.png"

type UnifyWindow = Window & {
  __unifyLoadingComplete?: boolean;
};

export default function LoadingScreen() {
  const [isMounting, setIsMounting] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    // Hide loading screen when page is fully loaded
    const handleLoad = () => {
      // Simulate min wait time for the loading animation to be seen
      setTimeout(() => {
        setIsLoading(false);
      }, 1500); 
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  // Handle the unmounting after animation completes
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        (window as UnifyWindow).__unifyLoadingComplete = true;
        setIsMounting(false);
        window.dispatchEvent(new Event("loadingComplete"));
      }, 800); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isMounting) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          dir={language === "ar" ? "rtl" : "ltr"}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-80" />

          {/* Main Logo Container */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center justify-center w-44 h-44"
            >
              {/* Outer Ripple Effect */}
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/30 bg-primary/5"
                animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border border-primary/20 bg-primary/5"
                animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1.25, ease: "easeOut" }}
              />

              {/* Minimal Spinner */}
              <motion.div
                className="absolute inset-1 border-[1.5px] border-transparent border-t-primary/60 border-r-primary/40 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 border border-transparent border-b-secondary/50 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Logo */}
              <img
                src={unifyLogo}
                alt="Unify Logo"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-28 w-auto object-contain relative z-10 drop-shadow-2xl"
              />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="text-center flex flex-col items-center gap-3"
            >
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                {language === "ar" ? "يونيفاي" : "Unify"}
              </h1>
              
              <div className="flex flex-col items-center justify-center gap-2 mt-2">
                <span className={`text-sm font-semibold text-slate-500 ${language === 'en' ? 'tracking-[0.2em]' : ''} uppercase`}>
                  {language === "ar" ? "جاري التحميل" : "Loading"}
                </span>
                <div className="flex gap-1.5 justify-center">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 bg-secondary/70 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-secondary/70 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-secondary/70 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
