import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Info, Search as SearchIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import MissingPersonCard from '../components/search/MissingPersonCard';
import PageHeader from '../components/ui/PageHeader';
import FoundPersonCard from '../components/search/FoundPersonCard';
import { motion } from 'framer-motion';
import SearchFiltersPanel, { type SearchFilters } from '../components/search/SearchFiltersPanel';
import UnderlineTabSelector from '../components/ui/UnderlineTabSelector';
import InfoBanner from '../components/ui/InfoBanner';
import { ApiError, type BackendPost, postApi } from '@/lib/api';
import type { ProfileData } from '@/components/home/PersonCard';
import { mapPostFields } from '@/lib/postFormatters';

export type SearchProfile = ProfileData & {
  dateMissing?: string;
  rawClothing?: string;
  rawLocation?: string;
};

export const defaultSearchFilters: SearchFilters = {
  firstName: '',
  lastName: '',
  ageMin: '',
  ageMax: '',
  hairColor: '',
  eyeColor: '',
  gender: '',
  location: '',
  clothing: '',
  dateMissing: '',
  city: '',
};

export const mapBackendPostToCard = (post: BackendPost, isRTL: boolean): SearchProfile => {
  const fields = mapPostFields(post, isRTL);
  return {
    id: post._id,
    type: post.postType,
    name: fields.name,
    status: post.status,
    location: fields.location,
    timeAgo: fields.timeAgo,
    details: fields.details,
    image: post.postImage,
    city: fields.city,
    age: fields.age,
    physicalDescription: fields.physicalDescription,
    clothingDescription: fields.clothingDescription,
    lastSeenLocationDetails: fields.lastSeenLocationDetails,
    foundLocationDetails: fields.foundLocationDetails,
    reportDate: fields.reportDate,
    rawClothing: post.clothesDescription?.toLowerCase(),
    rawLocation: (post.postType === 'missing' ? post.lastSeenLocation : post.foundLocation)?.toLowerCase(),
    dateMissing: post.lastSeenDate,
    postedBy: fields.postedBy,
    postUserId: fields.postUserId,
  };
};

const applyLocalFilters = (posts: SearchProfile[], filters: SearchFilters): SearchProfile[] => {
  const normalize = (value: string) => value.trim().toLowerCase();

  return posts.filter((post) => {
    const location = normalize(post.location);
    const citySource = normalize(post.city ?? '');

    if (filters.city) {
      const cityNeedle = normalize(filters.city);
      const matchesCity = location.includes(cityNeedle) || citySource.includes(cityNeedle);
      if (!matchesCity) return false;
    }

    if (filters.location && !(post.rawLocation ?? '').includes(normalize(filters.location))) {
      return false;
    }

    if (filters.clothing && !(post.rawClothing ?? '').includes(normalize(filters.clothing))) {
      return false;
    }

    return true;
  });
};

export default function Search() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const resultsRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the payload passed from Hero (if any)
  const initialQuery = location.state?.initialQuery || '';
  const initialImage = location.state?.initialImage || null;

  // The `tab` query string lets other pages (e.g. CreatePost on success)
  // open Search with the right tab pre-selected. Defaults to "missing".
  const initialTab = searchParams.get('tab') === 'found' ? 'found' : 'missing';
  const [activeTab, setActiveTab] = useState<'missing' | 'found'>(initialTab);
  
  // Set initial filters using the query passed from Hero, or passed back from SearchResults
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(
    location.state?.initialFilters || {
      ...defaultSearchFilters,
      firstName: initialQuery.split(' ')[0] || '',
      lastName: initialQuery.split(' ').slice(1).join(' ') || ''
    }
  );
  
  // New state to hold image search results 
  const [isImageSearchActive, setIsImageSearchActive] = useState<boolean>(false);
  const [rawPosts, setRawPosts] = useState<BackendPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialImagePreview, setInitialImagePreview] = useState<string | null>(null);

  // After a successful post creation we land here with `?scrollTo=results` —
  // wait for the results section to render, then smoothly scroll to it so
  // the user sees the cards immediately.
  useEffect(() => {
    if (searchParams.get('scrollTo') !== 'results') return;
    if (isLoading) return;
    const timer = window.setTimeout(() => {
      const el = resultsRef.current;
      if (!el) return;
      // Prefer to scroll the page so the results header sits just below the
      // fixed site header. We compute the target top offset and call
      // window.scrollTo rather than relying on scrollIntoView which can
      // produce inconsistent offsets across browsers when other layout
      // shifts (images/animations) occur.
      const header = document.querySelector('header') || document.querySelector('nav');
      const headerHeight = header ? header.getBoundingClientRect().height : 88;
      const targetTop = el.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [searchParams, isLoading]);

  useEffect(() => {
    if (!initialImage) return;
    const previewUrl = URL.createObjectURL(initialImage);
    setInitialImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [initialImage]);

  useEffect(() => {
    // If an image search is active, we skip the normal textual fetch!
    if (isImageSearchActive) return;

    const fetchPosts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await postApi.getPosts({
          postType: activeTab,
          status: 'active',
          firstName: appliedFilters.firstName || undefined,
          lastName: appliedFilters.lastName || undefined,
          ageMin: appliedFilters.ageMin || undefined,
          ageMax: appliedFilters.ageMax || undefined,
          hairColour: appliedFilters.hairColor || undefined,
          eyeColour: appliedFilters.eyeColor || undefined,
          gender: appliedFilters.gender || undefined,
          city: appliedFilters.city || undefined,
          dateMissing: appliedFilters.dateMissing || undefined,
          page: 1,
          limit: 20,
        });

        setRawPosts(response.data);
      } catch (fetchErr) {
        setError(fetchErr instanceof ApiError ? fetchErr.message : 'Failed to load search results.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPosts();
  }, [activeTab, appliedFilters, isImageSearchActive]);

  // Re-map whenever the language flips so card copy (time, details, names,
  // locations) updates without needing a re-fetch.
  const posts = useMemo(
    () => rawPosts.map((p) => mapBackendPostToCard(p, isRTL)),
    [rawPosts, isRTL],
  );

  const filteredPosts = useMemo(() => {
    return applyLocalFilters(posts, appliedFilters);
  }, [posts, appliedFilters]);

  const handleApplyFilters = (
    values: SearchFilters,
    options?: { shouldScroll?: boolean; imageFile?: File | null }
  ) => {
    const shouldScroll = options?.shouldScroll ?? true;
    const imageFile = options?.imageFile ?? null;

    if (imageFile) {
      // Navigate to the new SearchResults page, passing the form data and the image
      navigate('/search-results', { state: { filters: values, imageFile } });
      return;
    }

    setAppliedFilters(values);
    setIsImageSearchActive(false);
    setRawPosts([]);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1">
        <PageHeader 
          navigatedTo={isRTL ? 'البحث' : 'Search'}
          title={isRTL ? 'البلاغات النشطة' : 'Active Reports'} 
          subtitle={isRTL ? 'ساعدنا في إعادتهم. تصفح حالات الأشخاص المفقودين النشطة.' : 'Help us bring them home. Browse active missing person cases.'} 
          showArrow={true}
        />
        <div className="max-w-400 mx-auto px-6 lg:px-12 w-full">
          <InfoBanner
            icon={<Info className="h-5 w-5" aria-hidden="true" />}
            title={t('search.tipLabel') || 'Pro Tip:'}
            message={t('search.tipText') || 'Providing multiple filters helps narrow down the results effectively.'}
            className="mt-4 mb-6"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <SearchFiltersPanel
              onApplyFilters={handleApplyFilters}
              initialFilters={appliedFilters}
              initialImageFile={initialImage}
              initialImagePreview={initialImagePreview}
            />
          </motion.div>

          {/* Results Area */}
          <motion.div
            ref={resultsRef}
            className="mb-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {!isImageSearchActive && (
              <UnderlineTabSelector
                options={[
                  { value: 'missing', label: t('search.missingReports') || 'Missing Reports' },
                  { value: 'found', label: t('search.foundPersons') || 'Found Persons' },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value as 'missing' | 'found')}
                indicatorLayoutId="activeTabIndicatorSearch"
              />
            )}

            {isImageSearchActive && (
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  {isRTL ? 'مطابقات البحث بالذكاء الاصطناعي' : 'AI Facial Search Matches'}
                </h3>
                <button 
                  onClick={() => {
                    setIsImageSearchActive(false);
                    // Update location state to remove image so refresh doesn't trigger it
                    window.history.replaceState({}, '');
                  }} 
                  className="text-sm font-medium text-slate-500 hover:text-red-500"
                >
                  {isRTL ? 'إلغاء البحث بالصور' : 'Clear Image Search'}
                </button>
              </div>
            )}

            {/* Cards Slider Display */}
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p>{isRTL ? 'جاري تحميل النتائج...' : 'Loading results...'}</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-600 bg-white rounded-xl border border-dashed border-red-300">
                <p>{error}</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {filteredPosts.map((profile, idx) =>
                  profile.type === 'missing' ? (
                    <MissingPersonCard
                      key={profile.id}
                      profile={(profile as unknown as ProfileData)}
                      idx={idx}
                      isRTL={isRTL}
                    />
                  ) : (
                    <FoundPersonCard
                      key={profile.id}
                      profile={(profile as unknown as ProfileData)}
                      idx={idx}
                      isRTL={isRTL}
                    />
                  ),
                )}
              </motion.div>
            ) : (
               <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <SearchIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>{isRTL ? `لا توجد بلاغات ${activeTab === 'missing' ? 'فقدان' : 'عثور'} بهذه المعايير.` : `No ${activeTab} reports found matching these criteria.`}</p>
              </div>
            )}
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}