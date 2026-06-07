import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search as SearchIcon, ScanFace } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isAxiosError } from 'axios';
import PageHeader from '../components/ui/PageHeader';
import { axiosInstance } from '@/lib/axiosInstance';
import type { BackendPost } from '@/lib/api';
import MissingPersonCard from '../components/search/MissingPersonCard';
import FoundPersonCard from '../components/search/FoundPersonCard';
import SpotlightMatch from '../components/search/SpotlightMatch';
import type { ProfileData } from '../components/home/PersonCard';
import { mapBackendPostToCard } from './Search';
import type { SearchFilters } from '../components/search/SearchFiltersPanel';
import { motion } from 'framer-motion';

export default function SearchResults() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const location = useLocation();
  const navigate = useNavigate();

  // Read state passed from the Search page
  const filters = (location.state?.filters as SearchFilters) || {};
  const imageFile = location.state?.imageFile as File | null;

  const [rawPosts, setRawPosts] = useState<BackendPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user somehow lands here without an image, send them back
    if (!imageFile) {
      navigate('/search', { replace: true });
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('searchImage', imageFile);

      // Append textual filters if they exist
      if (filters.firstName) formData.append('firstName', filters.firstName);
      if (filters.lastName) formData.append('lastName', filters.lastName);
      if (filters.city) formData.append('city', filters.city);
      if (filters.location) formData.append('location', filters.location);
      if (filters.clothing) formData.append('clothing', filters.clothing);
      if (filters.gender) formData.append('gender', filters.gender);
      if (filters.ageMin) formData.append('ageMin', filters.ageMin);
      if (filters.ageMax) formData.append('ageMax', filters.ageMax);
      if (filters.hairColor) formData.append('hairColor', filters.hairColor);
      if (filters.eyeColor) formData.append('eyeColor', filters.eyeColor);

      try {
        const res = await axiosInstance.post('/posts/search-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // The AI API returns raw BackendPosts attached with `confidence`
        const postsFromApi = res.data.results || [];
        setRawPosts(postsFromApi);
      } catch (err: unknown) {
        setRawPosts([]);
        if (isAxiosError(err)) {
          const errorMessage = (err.response?.data as { message?: string } | undefined)?.message;
          setError(errorMessage ?? (isRTL ? 'فشل البحث بالصورة. تأكد من وجود وجه واضح.' : 'Failed to search by image. Make sure there is a visible face.'));
        } else {
          setError(isRTL ? 'فشل البحث بالصورة. تأكد من وجود وجه واضح.' : 'Failed to search by image. Make sure there is a visible face.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [imageFile, filters, navigate, isRTL]);

  const handleBack = () => {
    navigate('/search', {
      state: {
        initialFilters: filters,
        initialImage: imageFile,
      },
    });
  };

  const posts = useMemo(
    () => rawPosts.map((p) => mapBackendPostToCard(p, isRTL)),
    [rawPosts, isRTL],
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1">
        <PageHeader 
          navigatedTo={isRTL ? 'نتائج المطابقة الذكية' : 'AI Matching Results'}
          parentName={isRTL ? 'البحث' : 'Search'}
          parentHref="/search"
          parentIcon={<SearchIcon className="w-4 h-4" />}
          title={isRTL ? 'نتائج مطابقة الوجوه' : 'Facial Recognition Matches'} 
          subtitle={isRTL ? 'أهم التطابقات المحتملة بناءً على التحليل المدعوم بالذكاء الاصطناعي.' : 'Top potential matches based on AI-powered analysis.'} 
          showArrow={false}
        />
        
        <div className="max-w-400 mx-auto px-6 lg:px-12 w-full mt-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-secondary transition-colors mb-8 cursor-pointer"
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {isRTL ? 'العودة للبحث' : 'Back to Search'}
          </button>

          {isLoading ? (
            <div className="py-28 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
              {/* Background ambient glow */}
              <div className="absolute inset-0 bg-linear-to-b from-slate-50 to-white"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

              {/* Sexier Scanner Animation */}
              <div className="relative mb-10 z-10 flex items-center justify-center">
                {/* Background glow pulse */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"
                ></motion.div>
                
                {/* Center circle */}
                <div className="relative w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(212,180,74,0.3)] border-2 border-secondary/50 z-10 overflow-hidden">
                  
                  {/* Grid pattern background */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d4b44a 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                  
                  {/* Scanner line with glow */}
                  <motion.div 
                    animate={{ top: ['-10%', '110%', '-10%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-[3px] bg-secondary shadow-[0_0_20px_5px_rgba(212,180,74,0.8)] z-20"
                  ></motion.div>
                  
                  {/* Face Icon */}
                  <ScanFace className="w-14 h-14 text-white z-10" strokeWidth={1.5} />
                </div>
                
                {/* Floating particles/dots around */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-[1.5px] border-dashed border-secondary/40 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 border border-dashed border-slate-300 rounded-full"
                ></motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="z-10"
              >
                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                  {isRTL ? 'جاري تحليل الصورة...' : 'AI Face Analysis Active...'}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed font-medium">
                  {isRTL ? 'يقوم نظام الذكاء الاصطناعي بمقارنة الملامح واستخراج النقاط الوجهية بقاعدة البيانات...' : 'Extracting facial landmarks and running biometric matching against the database...'}
                </p>
              </motion.div>
            </div>
          ) : error ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-red-200 shadow-sm">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-2">{isRTL ? 'حدث خطأ' : 'An error occurred'}</h3>
              <p className="text-red-500 max-w-sm">{error}</p>
              <button 
                onClick={handleBack}
                className="mt-6 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-colors"
              >
                {isRTL ? 'حاول مجدداً' : 'Try Again'}
              </button>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-12">
              {/* TOP MATCH */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-secondary rounded-full" />
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {isRTL ? 'أقرب تطابق' : 'Closest Match'}
                  </h2>
                  <div className="ms-auto bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {(rawPosts[0] as any).confidence}% {isRTL ? 'تطابق' : 'Match'}
                  </div>
                </div>
                
                <div className="flex justify-center w-full">
                  <SpotlightMatch 
                    profile={posts[0] as unknown as ProfileData} 
                    rawPost={rawPosts[0] as any}
                    isRTL={isRTL} 
                  />
                </div>
              </div>

              {/* REST OF MATCHES */}
              {posts.length > 1 && (
                <div className="space-y-6 pt-8 border-t border-slate-200">
                  <h3 className="text-xl font-bold text-slate-700">
                    {isRTL ? 'تطابقات محتملة أخرى' : 'Other Potential Matches'}
                  </h3>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {posts.slice(1).map((profile, idx) => (
                      <div key={profile.id} className="relative w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]">
                        {/* Confidence Badge */}
                        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10 bg-white/90 backdrop-blur-md text-secondary border border-secondary/20 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm`}>
                          {(rawPosts[idx + 1] as any).confidence}% {isRTL ? 'تطابق' : 'Match'}
                        </div>
                        
                        {profile.type === 'missing' ? (
                          <MissingPersonCard
                            profile={profile as unknown as ProfileData}
                            idx={idx + 1}
                            isRTL={isRTL}
                            showImage={false}
                            className="!w-full"
                          />
                        ) : (
                          <FoundPersonCard
                            profile={profile as unknown as ProfileData}
                            idx={idx + 1}
                            isRTL={isRTL}
                            showImage={false}
                            className="!w-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <SearchIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {isRTL ? 'لم يتم العثور على نتائج' : 'No Matches Found'}
              </h3>
              <p className="max-w-md mx-auto">
                {isRTL ? 'لم يتم العثور على وجوه تطابق هذه الصورة بنسبة كافية في قاعدة بياناتنا.' : 'We could not find any faces matching this image with enough confidence in our database.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
