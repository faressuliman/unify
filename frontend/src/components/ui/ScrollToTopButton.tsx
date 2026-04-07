import { CircleFadingArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-0 w-12 h-12 rounded-full bg-primary hover:bg-primary-600 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer border-none animate-bounce"
          aria-label="Scroll to top"
        >
          <CircleFadingArrowUp className="h-7 w-7 text-tertiary" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
