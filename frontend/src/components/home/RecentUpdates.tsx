import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { type ProfileData } from './PersonCard';
import FoundPersonCard from '../search/FoundPersonCard';
import MissingPersonCard from '../search/MissingPersonCard';
import { en } from '../../data/english';
import { ar } from '../../data/arabic';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import UnderlineTabSelector from '../ui/UnderlineTabSelector';
import { postApi, type BackendPost } from '@/lib/api';

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

const mapBackendPostToCard = (post: BackendPost): ProfileData => {
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
  };
};

export default function RecentUpdates() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = isRTL ? ar.recentUpdates : en.recentUpdates;

  const [activeTab, setActiveTab] = useState<'missing' | 'found'>('missing');
  const [posts, setPosts] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await postApi.getPosts({
          postType: activeTab,
          status: 'active',
          page: 1,
          limit: 4,
        });
        setPosts(response.data.map(mapBackendPostToCard));
      } catch (err) {
        console.error('Failed to load recent posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchPosts();
  }, [activeTab]);

  return (
    <section className="w-full bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-400 mx-auto px-6 lg:px-12 py-12">
        
        {/* Header */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 flex flex-col items-start gap-1"
        >
            <div className="flex items-center gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-tertiary tracking-widest rtl:tracking-normal uppercase">
                    {t.title}
                </h2>
                {language === 'en' ? (
                    <ArrowDownRight className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:translate-x-1 hover:translate-y-1" />
                ) : (
                    <ArrowDownLeft className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:-translate-x-1 hover:translate-y-1" />
                )}
            </div>
            <p className="text-gray-500 mt-1 text-sm">
                {t.subtitle}
            </p>
        </motion.div>

        {/* Tab Selector */}
        <div className="mb-6 flex justify-center sm:justify-start">
          <UnderlineTabSelector
            options={[
              { value: 'missing', label: isRTL ? 'اشخاص مفقودين' : 'Missing Persons' },
              { value: 'found', label: isRTL ? 'اشخاص تم العثور عليهم' : 'Found Persons' }
            ]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as 'missing' | 'found')}
            indicatorLayoutId="activeTabIndicatorRecentUpdates"
          />
        </div>

        {/* Scrollable Cards Container */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {posts.map((profile, idx) => (
              profile.type === 'found' ? (
                <FoundPersonCard key={profile.id} profile={profile} idx={idx} isRTL={isRTL} />
              ) : (
                <MissingPersonCard key={profile.id} profile={profile} idx={idx} isRTL={isRTL} />
              )
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            {isRTL ? 'لا توجد بيانات متاحة حالياً' : 'No recent updates available at the moment'}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button className="px-8 sm:px-10 py-3 rounded-full bg-primary text-slate-900 font-bold hover:bg-[#e6dcaf] transition-colors duration-300 text-sm sm:text-base cursor-pointer">
            {t.loadMore}
          </button>
        </motion.div>
      </div>
    </section>
  );
}