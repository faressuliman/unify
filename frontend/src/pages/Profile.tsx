import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, FileText, CheckCircle, ShieldCheck, Mail, Phone, Calendar, ArrowDownRight, ArrowDownLeft, ChevronRight, ChevronLeft, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { mockPosts } from '../data/mockData';
import MissingPersonCard from '../components/search/MissingPersonCard';
import FoundPersonCard from '../components/search/FoundPersonCard';
import UnderlineTabSelector from '../components/ui/UnderlineTabSelector';

export default function Profile() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState<'missing' | 'found'>('missing');
  const cardsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filteredPosts = useMemo(() => {
    return mockPosts.filter((post) => post.type === activeTab);
  }, [activeTab]);

  const updateScrollControls = () => {
    if (!cardsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = cardsRef.current;
    setCanScrollLeft(Math.abs(scrollLeft) > 5);
    setCanScrollRight(Math.round(Math.abs(scrollLeft) + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollControls();
    window.addEventListener('resize', updateScrollControls);
    return () => window.removeEventListener('resize', updateScrollControls);
  }, [activeTab, filteredPosts.length]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader 
        navigatedTo={isRTL ? 'الملف الشخصي' : 'Profile'}
        title={isRTL ? 'ملفي الشخصي' : 'My Profile'} 
        subtitle={isRTL ? 'إدارة تقاريرك ومعلومات حسابك' : 'Manage your reports and account information.'} 
        showArrow={true}
      />

      <main className="w-full max-w-400 mx-auto px-6 lg:px-12 flex flex-col gap-6">
        
        {/* Profile Hero Section */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-5 md:p-6 rounded-2xl border border-primary-200 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-sm relative overflow-hidden"
        >
          {/* subtle decorative background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6 z-10 w-full md:w-auto">
            <div className="relative shrink-0">
                <div className="w-24 h-24 bg-[#faebd7] rounded-full flex items-center justify-center p-2">
                  <div 
                    className="w-full h-full bg-center bg-no-repeat bg-cover rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCMzzcyDv1VecMu2b3TptcTl6V-PG_pTPMT4YzAHdg5TJ4jweX5dnl9HbvVJpawn90saLwMTkyy0PFj4KkCaPT-KB_VD_4oG0BYEXzMK7eM4e_UrbrrTc-BWrYem17OJE7vPnbI3Y8pIQ4BAJ97GFCAcVV87wG6EOFgK0ikKoIWghhTxj8cDLyYedzp5jANG9Ey7Fcxq0bn1pV1gZQO_Ol7w8eAzY_1CVft0NSgBEboO6Ue26xGT194Pa8TsgfTc-k6SMbPeW13R2TT")` }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm translate-x-1/4 translate-y-1/4">
                    <CheckCircle className="w-5 h-5 text-secondary" />
                </div>
            </div>

            <div className="flex-1 text-center md:text-start w-full">
              <h1 className="text-tertiary text-2xl font-bold mb-2 md:mb-3">Ahmed Hassan</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
                <p className="text-slate-500 text-sm flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <Calendar className="w-4 h-4 text-secondary" /> Oct 2023
                </p>
                <p className="text-slate-500 text-sm flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <MapPin className="w-4 h-4 text-secondary" /> Cairo, Egypt
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-row gap-3 w-full md:w-auto z-10 justify-center md:self-start">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100/80 text-[#212a4a] rounded-[10px] font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer">
                {isRTL ? 'تعديل الملف' : 'Edit Profile'}
            </button>
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#fef5da] text-[#1c190d] font-semibold text-sm rounded-[10px] border border-[#faebd7] hover:bg-[#ffe5a0] transition-all cursor-pointer shadow-xs">
                {isRTL ? 'إضافة حالة' : 'Report New Case'}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Information */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Account Information (Replaces Map/Activity) */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 border-b border-primary-100">
                <h3 className="text-tertiary font-bold text-start">{isRTL ? 'معلومات الحساب' : 'Account Information'}</h3>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                      <Mail className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-start min-w-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</p>
                      <p className="text-sm font-bold text-tertiary truncate">ahmed.hassan@example.com</p>
                    </div>
                  </div>
                  <button className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" aria-label={isRTL ? 'تعديل' : 'Edit'}>
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                      <Phone className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-start min-w-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</p>
                      <p className="text-sm font-bold text-tertiary">+20 120 000 0000</p>
                    </div>
                  </div>
                  <button className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" aria-label={isRTL ? 'تعديل' : 'Edit'}>
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-start gap-4 p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">{isRTL ? 'حالة التوثيق' : 'Verification Status'}</p>
                    <p className="text-sm font-bold text-tertiary">National ID Verified</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Claims History */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.15 }}
               className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 border-b border-primary-100 flex items-center justify-between">
                <h3 className="text-tertiary font-bold text-start">{isRTL ? 'المطالبات الأخيرة' : 'Recent Claims'}</h3>
                {/* View All removed per request */}
              </div>
              <div className="divide-y divide-primary-100">
                <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 rounded-lg bg-white text-secondary flex items-center justify-center shrink-0 border border-primary-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start text-start">
                    <p className="text-sm font-bold text-tertiary">New Lead Provided</p>
                    <p className="text-xs text-slate-500">Case #29401 - Alexandria</p>
                    <span className="text-[10px] mt-1 text-slate-400">2 hours ago</span>
                  </div>
                </div>
                <div className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 rounded-lg bg-white text-secondary flex items-center justify-center shrink-0 border border-primary-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start text-start">
                    <p className="text-sm font-bold text-tertiary">Claim Verified</p>
                    <p className="text-xs text-slate-500">Identity match confirmed by Ministry</p>
                    <span className="text-[10px] mt-1 text-slate-400">Yesterday</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Case Management */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="flex flex-col w-full"
            >
              <div className="flex items-center gap-2 mb-2 text-start">
                <h2 className="text-xl font-bold text-tertiary">{isRTL ? 'منشوراتي' : 'My Posts'}</h2>
                {isRTL ? (
                  <ArrowDownLeft className="h-5 w-5 text-secondary shrink-0" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-secondary shrink-0" />
                )}
              </div>
              <UnderlineTabSelector
                options={[
                  { value: 'missing', label: t('search.missingReports') || (isRTL ? 'البلاغات النشطة' : 'Missing Reports') },
                  { value: 'found', label: t('search.foundPersons') || (isRTL ? 'الأشخاص المعثور عليهم' : 'Found Persons') },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value as 'missing' | 'found')}
                indicatorLayoutId="activeTabIndicatorProfile"
              />

              {/* Cards Display */}
              <div className="relative">
                <motion.div
                   ref={cardsRef}
                   onScroll={updateScrollControls}
                   key={activeTab}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.4 }}
                   className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((profile, idx) => (
                      activeTab === 'missing' ? (
                        <MissingPersonCard
                          key={profile.id}
                          profile={profile}
                          idx={idx}
                          isRTL={isRTL}
                          showImage={true}
                          className="min-w-70! sm:min-w-[320px]! lg:min-w-0! lg:w-[calc(48%-1rem)] xl:w-[calc(36.5%-1rem)] flex-none!"
                        />
                      ) : (
                        <FoundPersonCard
                          key={profile.id}
                          profile={profile}
                          idx={idx}
                          isRTL={isRTL}
                          showImage={true}
                          className="min-w-70! sm:min-w-[320px]! lg:min-w-0! lg:w-[calc(48%-1rem)] xl:w-[calc(36.5%-1rem)] flex-none!"
                        />
                      )
                    ))
                  ) : (
                    <div className="py-12 w-full text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                      <p>{isRTL ? 'لا توجد تقارير.' : 'No reports found.'}</p>
                    </div>
                  )}
                </motion.div>

                {filteredPosts.length > 2 && canScrollLeft && (
                  <button
                    onClick={() => cardsRef.current?.scrollBy({ left: isRTL ? 320 : -320, behavior: 'smooth' })}
                    className={`hidden lg:flex absolute ${isRTL ? '-right-4' : '-left-4'} top-[42%] -translate-y-1/2 z-10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-full p-2 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer text-tertiary`}
                    aria-label="Scroll left"
                  >
                    {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                )}

                {filteredPosts.length > 2 && canScrollRight && (
                  <button
                    onClick={() => cardsRef.current?.scrollBy({ left: isRTL ? -320 : 320, behavior: 'smooth' })}
                    className={`hidden lg:flex absolute ${isRTL ? '-left-4' : '-right-4'} top-[42%] -translate-y-1/2 z-10 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-full p-2 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer text-tertiary`}
                    aria-label="Scroll right"
                  >
                    {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                )}
              </div>

            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}