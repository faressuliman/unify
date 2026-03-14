import { useRef, useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Search, ImagePlus, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';

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
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
    <section className="relative px-4 flex flex-col items-center justify-center text-center overflow-hidden min-h-[calc(100vh-80px)]" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Background Layer - Prepared for Slideshow */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-gray-50/50">
        {backgroundImages.length > 0 ? (
           /* Logic to handle background images if provided */
           <div className="absolute inset-0 h-full w-full">
             <img 
                src={backgroundImages[0]} 
                alt="Background" 
                className="w-full h-full object-cover"
             />
             {/* Overlay for text readability over images */}
             <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
           </div>
        ) : (
          /* Default Abstract Background */
          <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px]"></div>
          </div>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto w-full z-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-fade-in leading-[1.1]">
          {content.title}
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 px-4">
          {content.subtitle}
        </p>
        
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-orange-300 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            
            {/* Search form is ready to plug into backend search endpoint */}
            <form onSubmit={handleSubmit} className="relative flex items-center bg-white rounded-xl shadow-xl overflow-hidden p-1.5 gap-2">
              <div className="flex-1 flex items-center px-2 h-10 md:h-12 w-full">
                <Search className="text-gray-400 h-5 w-5 shrink-0" />
                <input
                  name="query"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="flex-1 border-none focus:ring-0 text-base px-3 bg-transparent placeholder:text-gray-400 outline-none w-full h-full truncate"
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
                    className="relative w-9 h-9 rounded-md overflow-hidden group/clear cursor-pointer border border-gray-200 shrink-0"
                    title={isRTL ? "إزالة الصورة" : "Clear image"}
                    aria-label="Clear image"
                  >
                    <img src={imagePreview} alt="Selected preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/clear:opacity-100 transition-opacity flex items-center justify-center">
                      <X className="h-4 w-4 text-white drop-shadow-md" strokeWidth={3} />
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={triggerImagePicker}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors group/upload cursor-pointer shrink-0"
                    title={isRTL ? "بحث بالصورة" : "Search by image"}
                    aria-label="Search by image"
                  >
                    <ImagePlus className="h-5 w-5 text-gray-400 group-hover/upload:text-primary transition-colors" />
                  </button>
                )}
              </div>

              <button type="submit" className="bg-primary text-[#1c190d] font-bold px-5 py-2 md:px-8 md:py-3 rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap text-sm md:text-base">
                {content.searchButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
