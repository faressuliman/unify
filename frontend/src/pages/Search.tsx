import { useEffect, useMemo, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import MissingPersonCard from '../components/search/MissingPersonCard';
import PageHeader from '../components/ui/PageHeader';
import FoundPersonCard from '../components/search/FoundPersonCard';
import { motion } from 'framer-motion';
import SearchFiltersPanel, { defaultSearchFilters, type SearchFilters } from '../components/search/SearchFiltersPanel';
import UnderlineTabSelector from '../components/ui/UnderlineTabSelector';
import { ApiError, type BackendPost, postApi } from '@/lib/api';
import type { ProfileData } from '@/components/home/PersonCard';

type SearchProfile = ProfileData & {
  dateMissing?: string;
  rawClothing?: string;
  rawLocation?: string;
};

const humanizeTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'Recently posted';

  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = Math.max(now - then, 0);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Less than 1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} months ago`;
};

const mapBackendPostToCard = (post: BackendPost): SearchProfile => {
  const ageWithUnit = post.age ? `${post.age} ${post.ageUnit ?? 'years'}` : 'Unknown age';
  const gender = post.gender ? post.gender[0].toUpperCase() + post.gender.slice(1) : 'Unknown';

  return {
    id: post._id,
    type: post.postType,
    name: post.name,
    status: post.status,
    location: post.postType === 'missing' ? post.lastSeenLocation ?? post.city ?? 'Unknown location' : post.foundLocation ?? post.city ?? 'Unknown location',
    timeAgo: humanizeTimeAgo(post.createdAt),
    details: `${gender}, ${ageWithUnit}`,
    image: post.postImages?.[0],
    city: post.city,
    age: post.age ? `${post.age} ${post.ageUnit ?? 'years'}` : undefined,
    physicalDescription: [post.hairColour, post.eyeColour].filter(Boolean).join(', '),
    clothingDescription: post.clothesDescription,
    lastSeenLocationDetails: post.lastSeenLocation,
    foundLocationDetails: post.foundLocation,
    reportDate: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : undefined,
    rawClothing: post.clothesDescription?.toLowerCase(),
    rawLocation: (post.postType === 'missing' ? post.lastSeenLocation : post.foundLocation)?.toLowerCase(),
    dateMissing: post.lastSeenDate,
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
  const [activeTab, setActiveTab] = useState<'missing' | 'found'>('missing');
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [posts, setPosts] = useState<SearchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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

        setPosts(response.data.map(mapBackendPostToCard));
      } catch (fetchErr) {
        setError(fetchErr instanceof ApiError ? fetchErr.message : 'Failed to load search results.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPosts();
  }, [activeTab, appliedFilters]);

  const filteredPosts = useMemo(() => {
    return applyLocalFilters(posts, appliedFilters);
  }, [posts, appliedFilters]);

  const handleApplyFilters = (values: SearchFilters, shouldScroll = true) => {
    setAppliedFilters(values);

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
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <SearchFiltersPanel onApplyFilters={handleApplyFilters} />
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
            <UnderlineTabSelector
              options={[
                { value: 'missing', label: t('search.missingReports') || 'Missing Reports' },
                { value: 'found', label: t('search.foundPersons') || 'Found Persons' },
              ]}
              value={activeTab}
              onChange={(value) => setActiveTab(value as 'missing' | 'found')}
              indicatorLayoutId="activeTabIndicatorSearch"
            />

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
                {filteredPosts.map((profile, idx) => (
                  activeTab === 'missing' ? (
                    <MissingPersonCard 
                      key={profile.id} 
                      profile={profile} 
                      idx={idx} 
                      isRTL={isRTL} 
                    />
                  ) : (
                    <FoundPersonCard 
                      key={profile.id} 
                      profile={profile} 
                      idx={idx} 
                      isRTL={isRTL} 
                    />
                  )
                ))}
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