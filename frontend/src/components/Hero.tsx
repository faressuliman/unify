import { useRef, useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Search, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';

type UnifyWindow = Window & {
  __unifyLoadingComplete?: boolean;
};

export interface HeroSearchPayload {
  query: string;
  image: File | null;
}

interface HeroProps {
  // Optional prop for future usage - pass an array of image URLs to enable slideshow/background
  backgroundImages?: string[];
  onSearchSubmit?: (payload: HeroSearchPayload) => void;
}

export default function Hero({ backgroundImages = [], onSearchSubmit }: HeroProps) {
  const { language } = useLanguage();
  const content = language === 'ar' ? ar.hero : en.hero;
  const isRTL = language === 'ar';
  const titleParts = content.title
    .split(/[،,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(() => {
    return Boolean((window as UnifyWindow).__unifyLoadingComplete);
  });

  useEffect(() => {
    if ((window as UnifyWindow).__unifyLoadingComplete) {
      setIsReady(true);
      return;
    }

    const handleReady = () => setIsReady(true);
    window.addEventListener('loadingComplete', handleReady);

    // Fallback in case custom loading event is missed.
    const timer = setTimeout(() => setIsReady(true), 1200);

    return () => {
      window.removeEventListener('loadingComplete', handleReady);
      clearTimeout(timer);
    };
  }, []);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSearchSubmit?.({
      query: query.trim(),
      image: imageFile,
    });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const triggerImagePicker = () => {
    imageInputRef.current?.click();
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <section 
      className="relative isolate min-h-150 flex flex-col items-center justify-center overflow-hidden bg-slate-50" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
        {backgroundImages.length > 0 ? (
           <div className="absolute inset-0 h-full w-full">
             <img 
                src={backgroundImages[0]} 
                alt="Background" 
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
             />
             <div className="absolute inset-0 bg-linear-to-b from-slate-50/80 via-white/80 to-white backdrop-blur-[2px]"></div>
           </div>
        ) : (
          <>
            {/* Blurred background orbs */}
            <div className="absolute top-1/2 left-1/4 md:left-1/3 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[50vw] md:h-[50vw] max-w-150 max-h-150 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[80px] opacity-70 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 md:right-1/3 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[50vw] md:h-[50vw] max-w-150 max-h-150 bg-teal-50/60 rounded-full mix-blend-multiply filter blur-[60px] md:blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] md:w-[60vw] md:h-[60vw] max-w-200 max-h-200 bg-primary/5 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-60 animate-blob animation-delay-4000"></div>
            
            {/* Animated rings with effects */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[1, 2, 3, 4].map((ring) => {
                const ringColors = [
                  'border-blue-300/40',
                  'border-cyan-300/35',
                  'border-blue-200/30',
                  'border-teal-200/35',
                ];
                const shadowColors = [
                  'shadow-lg shadow-blue-200/20',
                  'shadow-lg shadow-cyan-200/20',
                  'shadow-lg shadow-blue-100/15',
                  'shadow-lg shadow-teal-200/20',
                ];
                return (
                  <motion.div
                    key={ring}
                    className={`absolute rounded-full border-2 ${ringColors[ring - 1]} ${shadowColors[ring - 1]} backdrop-blur-[0.5px]`}
                    style={{
                      width: `${140 + ring * 130}px`,
                      height: `${140 + ring * 130}px`,
                    }}
                    animate={{
                      scale: [0.98, 1.06, 0.98],
                      opacity: [0.25, 0.5, 0.25],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 8 + ring,
                      repeat: Infinity,
                      delay: ring * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>
            
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
          </>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto w-full z-10 flex flex-col items-center py-16 px-6 lg:px-8">
        
        {/* Soft, welcoming typography */}
        <div className="text-center mb-10 max-w-5xl">
          <AnimatePresence>
            {isReady && (
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-tertiary leading-[1.2] flex flex-wrap md:flex-nowrap justify-center gap-y-2 gap-x-[0.3em]"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.04 }
                  }
                }}
              >
                {titleParts.map((part, partIndex) => (
                  <span key={partIndex} className="flex justify-center flex-wrap md:flex-nowrap w-full md:w-auto">
                    {part.split(' ').map((word, wordIndex, wordArray) => (
                      <span key={`${partIndex}-${wordIndex}`} className="flex">
                        <motion.span
                          className="whitespace-nowrap inline-block"
                          variants={{
                            hidden: { opacity: 0, y: 5 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          {word}
                        </motion.span>
                        {/* Only add space if it's not the last word of this part */}
                        {wordIndex < wordArray.length - 1 && (
                          <span className="inline-block w-[0.3em]" />
                        )}
                        {/* Add comma directly to the last word of the first part! no space wrapper! */}
                        {wordIndex === wordArray.length - 1 && partIndex === 0 && titleParts.length > 1 && (
                          <motion.span
                            className="inline-block"
                            variants={{
                              hidden: { opacity: 0, y: 5 },
                              visible: { opacity: 1, y: 0 }
                            }}
                          >
                            {isRTL ? '،' : ','}
                          </motion.span>
                        )}
                      </span>
                    ))}
                  </span>
                ))}
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isReady && (
              <motion.p 
                className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {content.subtitle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Approchable, clean search container */}
        <AnimatePresence>
          {isReady && (
            <motion.div 
              className="w-full max-w-3xl px-2 sm:px-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            >
              <form 
            onSubmit={handleSubmit} 
            className="relative flex items-center bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden p-2 gap-2 transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.1)] focus-within:border-primary/20 ring-1 ring-black/5"
          >
            <div className="flex-1 flex items-center px-4 h-12 md:h-14 w-full">
              <Search className="text-slate-400 h-5 w-5 shrink-0 hidden sm:block" strokeWidth={2} />
              
              <input
                name="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex-1 border-none focus:ring-0 text-base md:text-lg px-3 sm:px-4 bg-transparent text-slate-700 placeholder:text-slate-400 outline-none w-full h-full truncate font-medium"
                placeholder={content.placeholder}
                type="text"
              />

              <input
                ref={imageInputRef}
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Conditional button: preview image with clear action, otherwise trigger upload */}
              {imagePreview ? (
                <button
                  type="button"
                  onClick={clearImage}
                  className="relative w-10 h-10 rounded-full group/clear cursor-pointer shrink-0 ml-2 overflow-hidden ring-2 ring-primary/20"
                  title={isRTL ? "إزالة الصورة" : "Clear image"}
                  aria-label="Clear image"
                >
                  <img src={imagePreview} alt="Selected preview" className="w-full h-full object-cover" />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/clear:opacity-100 transition-opacity flex items-center justify-center">
                    <X className="h-4 w-4 text-white drop-shadow-md" strokeWidth={2.5} />
                  </div>
                  
                  {/* Always-visible X badge for mobile */}
                  <div className="absolute -top-0.5 -right-0.5 rtl:-left-0.5 rtl:right-auto lg:hidden bg-slate-800 text-white rounded-full p-0.5 shadow-sm flex items-center justify-center scale-75">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={triggerImagePicker}
                  className="p-2.5 sm:p-3 hover:bg-primary rounded-full transition-colors group/upload cursor-pointer shrink-0 ml-1 sm:ml-2 text-slate-400 hover:text-secondary duration-300"
                  title={isRTL ? "بحث بالصورة" : "Search by image"}
                  aria-label="Search by image"
                >
                  <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover/upload:scale-105" strokeWidth={2} />
                </button>
              )}
            </div>

            <button 
              type="submit" 
              className="bg-primary text-primary-foreground font-semibold px-6 py-3 md:px-8 md:py-3.5 rounded-full hover:bg-primary/95 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all cursor-pointer whitespace-nowrap text-sm md:text-base flex items-center justify-center min-w-12"
            >
              <span className="hidden sm:inline">{content.searchButton}</span>
              <Search className="h-5 w-5 sm:hidden" strokeWidth={2.5} />
            </button>
          </form>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium opacity-80">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {isRTL ? 'نحن هنا لمساعدتك في العثور عليهم' : 'We are here to help you find them'}
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
