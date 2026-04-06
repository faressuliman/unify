import { useMemo, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { mockPosts, type MissingPerson } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import MissingPersonCard from '../components/search/MissingPersonCard';
import PageHeader from '../components/ui/PageHeader';
import FoundPersonCard from '../components/search/FoundPersonCard';
import { motion } from 'framer-motion';
import SearchFiltersPanel, { defaultSearchFilters, type SearchFilters } from '../components/search/SearchFiltersPanel';

const extractAge = (details: string): number | null => {
  const match = details.match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const applyFilters = (posts: MissingPerson[], filters: SearchFilters): MissingPerson[] => {
  const normalize = (value: string) => value.trim().toLowerCase();

  return posts.filter((post) => {
    const name = normalize(post.name);
    const details = normalize(post.details);
    const location = normalize(post.location);
    const citySource = normalize(post.city ?? '');

    if (filters.firstName && !name.includes(normalize(filters.firstName))) return false;
    if (filters.lastName && !name.includes(normalize(filters.lastName))) return false;
    if (filters.location && !location.includes(normalize(filters.location))) return false;
    if (filters.clothing && !details.includes(normalize(filters.clothing))) return false;
    if (filters.gender && !details.includes(normalize(filters.gender))) return false;
    if (filters.eyeColor && !details.includes(normalize(filters.eyeColor))) return false;
    if (filters.hairColor && !details.includes(normalize(filters.hairColor))) return false;

    if (filters.city) {
      const cityNeedle = normalize(filters.city);
      const matchesCity = location.includes(cityNeedle) || citySource.includes(cityNeedle);
      if (!matchesCity) return false;
    }

    if (filters.ageMin || filters.ageMax) {
      const age = extractAge(post.details);
      if (age === null) return false;

      const min = filters.ageMin ? Number(filters.ageMin) : null;
      const max = filters.ageMax ? Number(filters.ageMax) : null;

      if (min !== null && age < min) return false;
      if (max !== null && age > max) return false;
    }

    if (filters.dateMissing) {
      const postDate = (post as MissingPerson & { dateMissing?: string }).dateMissing;
      if (postDate && postDate !== filters.dateMissing) return false;
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

  const filteredPosts = useMemo(() => {
    const postsByType = mockPosts.filter((post) => post.type === activeTab);
    return applyFilters(postsByType, appliedFilters);
  }, [activeTab, appliedFilters]);

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
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('missing')}
                className={`py-3 px-8 text-sm sm:text-base font-bold transition-all duration-300 relative cursor-pointer ${
                  activeTab === 'missing' ? 'text-tertiary' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t('search.missingReports') || 'Missing Reports'}
                {activeTab === 'missing' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`py-3 px-8 text-sm sm:text-base font-bold transition-all duration-300 relative cursor-pointer ${
                  activeTab === 'found' ? 'text-tertiary' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t('search.foundPersons') || 'Found Persons'}
                {activeTab === 'found' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full"
                  />
                )}
              </button>
            </div>

            {/* Cards Slider Display */}
            {filteredPosts.length > 0 ? (
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
                <p>No {activeTab} reports found matching these criteria.</p>
              </div>
            )}
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}