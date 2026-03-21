import { useEffect, useState } from 'react';
import { HeartHandshake, UserSearch, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageContext';

type UnifyWindow = Window & {
  __unifyLoadingComplete?: boolean;
};

export default function Stats() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [isReady, setIsReady] = useState(() => {
    return Boolean((window as UnifyWindow).__unifyLoadingComplete);
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if ((window as UnifyWindow).__unifyLoadingComplete) {
      // Already complete, state is true
      return;
    }

    const handleReady = () => setIsReady(true);
    window.addEventListener('loadingComplete', handleReady);
    
    // Fallback timer
    const timer = setTimeout(() => setIsReady(true), 1200); 
    
    return () => {
      window.removeEventListener('loadingComplete', handleReady);
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isReady]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  return (
    <section className="bg-slate-50 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-400 mx-auto px-6 lg:px-12 py-8">
        <AnimatePresence>
          {isReady && (
            <>
              {/* Mobile Carousel */}
              <motion.div 
                className="md:hidden w-full"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-xl border border-gray-100 flex items-center justify-between px-3 py-5 hover:shadow-md transition-shadow">
                  {/* Left Arrow */}
                  <button
                    onClick={handlePrevSlide}
                    className="p-2 rounded-full text-secondary hover:bg-slate-100 transition-colors shrink-0"
                    aria-label="Previous slide"
                  >
                    {isRTL ? (
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>

                  {/* Carousel Content */}
                  <div className="flex-1 overflow-hidden px-3">
                    <AnimatePresence mode="wait">
                      {currentSlide === 0 && (
                        <motion.div 
                          key="slide-0"
                          className="flex items-center justify-start gap-3"
                          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-2.5 bg-primary rounded-full text-secondary shrink-0">
                            <HeartHandshake className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div className="text-start flex flex-col">
                            <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              {isRTL ? 'تم لم شملهم هذا الشهر' : 'Reunited This Month'}
                            </p>
                            <p className="text-xl font-bold text-slate-800 whitespace-nowrap">
                              {isRTL ? '124 عائلة' : '124 Families'}
                            </p>
                            <p className="text-[10px] text-secondary font-bold mt-0.5 whitespace-nowrap">
                              {isRTL ? '+12% عن الشهر الماضي' : '+12% from last month'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {currentSlide === 1 && (
                        <motion.div 
                          key="slide-1"
                          className="flex items-center justify-start gap-3"
                          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-2.5 bg-primary rounded-full text-secondary shrink-0">
                            <UserSearch className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div className="text-start flex flex-col">
                            <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              {isRTL ? 'حالات البحث النشطة' : 'Active Searches'}
                            </p>
                            <p className="text-xl font-bold text-slate-800 whitespace-nowrap">
                              {isRTL ? '2,450 حالة' : '2,450 Cases'}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                              {isRTL ? 'يتم التحديث كل 10 دقائق' : 'Updates every 10 mins'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {currentSlide === 2 && (
                        <motion.div 
                          key="slide-2"
                          className="flex items-center justify-start gap-3"
                          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-2.5 bg-primary rounded-full text-secondary shrink-0">
                            <ShieldCheck className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div className="text-start flex flex-col">
                            <p className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              {isRTL ? 'عمليات تحقق موثقة' : 'Verified Matches'}
                            </p>
                            <p className="text-xl font-bold text-slate-800 whitespace-nowrap">
                              {isRTL ? '+18.5k مسجل' : '18.5k+ Users'}
                            </p>
                            <p className="text-[10px] text-secondary font-bold mt-0.5 whitespace-nowrap">
                              {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={handleNextSlide}
                    className="p-2 rounded-full text-secondary hover:bg-slate-100 transition-colors shrink-0"
                    aria-label="Next slide"
                  >
                    {isRTL ? (
                      <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Desktop Grid */}
              <motion.div 
                className="hidden md:grid grid-cols-3 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2, delayChildren: 0.6 }
                  }
                }}
              >
                {/* Card 1 - Reunited */}
                <motion.div 
                  className="bg-white p-5 lg:p-6 rounded-xl border border-gray-100 flex items-center justify-start gap-3 lg:gap-4 hover:shadow-md transition-shadow"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                >
                  <div className="p-2.5 lg:p-3 bg-primary rounded-full text-secondary shrink-0">
                    <HeartHandshake className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2} />
                  </div>
                  <div className="text-start flex flex-col">
                    <p className="text-xs lg:text-sm font-medium text-gray-500 whitespace-nowrap">
                      {isRTL ? 'تم لم شملهم هذا الشهر' : 'Reunited This Month'}
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 whitespace-nowrap">
                      {isRTL ? '124 عائلة' : '124 Families'}
                    </p>
                    <p className="text-[10px] lg:text-xs text-secondary font-bold mt-0.5 whitespace-nowrap">
                      {isRTL ? '+12% عن الشهر الماضي' : '+12% from last month'}
                    </p>
                  </div>
                </motion.div>

                {/* Card 2 - Active Searches */}
                <motion.div 
                  className="bg-white p-5 lg:p-6 rounded-xl border border-gray-100 flex items-center justify-start gap-3 lg:gap-4 hover:shadow-md transition-shadow"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                >
                  <div className="p-2.5 lg:p-3 bg-primary rounded-full text-secondary shrink-0">
                    <UserSearch className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2} />
                  </div>
                  <div className="text-start flex flex-col">
                    <p className="text-xs lg:text-sm font-medium text-gray-500 whitespace-nowrap">
                      {isRTL ? 'حالات البحث النشطة' : 'Active Searches'}
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 whitespace-nowrap">
                      {isRTL ? '2,450 حالة' : '2,450 Cases'}
                    </p>
                    <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                      {isRTL ? 'يتم التحديث كل 10 دقائق' : 'Updates every 10 mins'}
                    </p>
                  </div>
                </motion.div>

                {/* Card 3 - Verified Matches */}
                <motion.div 
                  className="bg-white p-5 lg:p-6 rounded-xl border border-gray-100 flex items-center justify-start gap-3 lg:gap-4 hover:shadow-md transition-shadow"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                  }}
                >
                  <div className="p-2.5 lg:p-3 bg-primary rounded-full text-secondary shrink-0">
                    <ShieldCheck className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2} />
                  </div>
                  <div className="text-start flex flex-col">
                    <p className="text-xs lg:text-sm font-medium text-gray-500 whitespace-nowrap">
                      {isRTL ? 'عمليات تحقق موثقة' : 'Verified Matches'}
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 whitespace-nowrap">
                      {isRTL ? '+18.5k مسجل' : '18.5k+ Users'}
                    </p>
                    <p className="text-[10px] lg:text-xs text-secondary font-bold mt-0.5 whitespace-nowrap">
                      {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}