import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Search, Calendar, FileSearch } from 'lucide-react';
import { mockPosts } from '../data/mockData';
import { useLanguage } from '../components/LanguageContext';
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../data/cities';
import MissingPersonCard from '../components/ui/MissingPersonCard';
import PageHeader from '../components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';
import FoundPersonCard from '../components/ui/FoundPersonCard';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'missing' | 'found'>('missing');
  
  const [filters, setFilters] = useState({
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
  });

  const [displayValues, setDisplayValues] = useState({
    hairColor: 'any',
    eyeColor: 'any',
    gender: 'any',
    city: 'any',
  });

  const handleCombinedSearch = () => {
    if (searchImage) {
      const imageUrl = URL.createObjectURL(searchImage);
      const foundPersons = mockPosts.filter((p) => p.type === 'found');
      
      const matches = foundPersons
        .slice(0, 5)
        .map((person, index) => ({
          ...person,
          matchPercentage: 95 - (index * 12) - Math.floor(Math.random() * 8)
        }))
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      navigate('/facial-match-results', { state: {
        facialMatchData: {
          uploadedImage: imageUrl,
          matches
        }
      }});
      return;
    }
  };

  const hairColors = [
    { value: 'Black', label: 'Black' },
    { value: 'Brown', label: 'Brown' },
    { value: 'Blonde', label: 'Blonde' },
    { value: 'Red', label: 'Red' },
    { value: 'Gray', label: 'Gray' },
    { value: 'White', label: 'White' },
  ];
  const eyeColors = [
    { value: 'Brown', label: 'Brown' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Green', label: 'Green' },
    { value: 'Hazel', label: 'Hazel' },
    { value: 'Gray', label: 'Gray' },
  ];

  const filteredPosts = mockPosts.filter(post => post.type === activeTab);

  const labelClass = "text-sm font-medium leading-none text-tertiary block";
  const inputClass = "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50/50";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1">
        <PageHeader 
          title={isRTL ? 'البلاغات النشطة' : 'Active Reports'} 
          subtitle={isRTL ? 'ساعدنا في إعادتهم. تصفح حالات الأشخاص المفقودين النشطة.' : 'Help us bring them home. Browse active missing person cases.'} 
          showArrow={true}
        />
        <div className="max-w-400 mx-auto px-6 lg:px-12 w-full">
          
          {/* Combined Search Form */}
          <div className="rounded-xl border border-primary-200 bg-white shadow-sm mb-12">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100 bg-white rounded-t-xl">
              <h3 className="font-semibold leading-none tracking-tight text-xl text-start text-tertiary flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-secondary" />
                {t('search.searchFormTitle') || 'Search & Filter'}
              </h3>
            </div>
            <div className="p-6 pt-6 space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <label htmlFor="searchImage" className="text-base font-bold text-tertiary block text-start">
                  {t('search.uploadImage') || 'Upload Image for AI Recognition'}
                </label>
                <div className="flex items-center justify-start">
                  <input
                    id="searchImage"
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchImage(e.target.files?.[0] || null)}
                    className="file:mr-4 rtl:file:ml-4 rtl:file:mr-0 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-[#1c190d] hover:file:bg-[#e6dcaf] file:cursor-pointer file:transition-colors text-sm text-slate-500 max-w-full"
                  />
                </div>
                <p className="text-sm text-gray-500 text-start block mt-2">
                  {t('search.imageSearchDesc') || 'Upload a photo to find potential matches using our facial recognition system.'}
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-500 font-medium">
                    {t('search.orUseFilters') || 'OR USE FILTERS'}
                  </span>
                </div>
              </div>

              {/* Filter Section */}
              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-start">
                    <label htmlFor="firstName" className={labelClass}>{t('search.firstName') || 'First Name'}</label>
                    <input
                      id="firstName"
                      placeholder={t('search.firstNamePlaceholder') || 'Enter first name'}
                      value={filters.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, firstName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <label htmlFor="lastName" className={labelClass}>{t('search.lastName') || 'Last Name'}</label>
                    <input
                      id="lastName"
                      placeholder={t('search.lastNamePlaceholder') || 'Enter last name'}
                      value={filters.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, lastName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-start">
                    <label htmlFor="ageMin" className={labelClass}>{t('search.ageMin') || 'Minimum Age'}</label>
                    <input
                      id="ageMin"
                      type="number"
                      placeholder={t('search.ageMinPlaceholder') || 'Min age'}
                      value={filters.ageMin}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, ageMin: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 text-start">
                    <label htmlFor="ageMax" className={labelClass}>{t('search.ageMax') || 'Maximum Age'}</label>
                    <input
                      id="ageMax"
                      type="number"
                      placeholder={t('search.ageMaxPlaceholder') || 'Max age'}
                      value={filters.ageMax}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, ageMax: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-start">
                    <label htmlFor="gender" className={labelClass}>{t('search.gender') || 'Gender'}</label>
                    <select
                      id="gender"
                      value={displayValues.gender}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        setDisplayValues({ ...displayValues, gender: value });
                        setFilters({ ...filters, gender: value === 'any' ? '' : value });
                      }}
                      className={inputClass}
                    >
                      <option value="any">Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2 text-start">
                    <label htmlFor="eyeColor" className={labelClass}>{t('search.eyeColor') || 'Eye Color'}</label>
                    <select
                      id="eyeColor"
                      value={displayValues.eyeColor}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        setDisplayValues({ ...displayValues, eyeColor: value });
                        setFilters({ ...filters, eyeColor: value === 'any' ? '' : value });
                      }}
                      className={inputClass}
                    >
                      <option value="any">Any</option>
                      {eyeColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-start">
                    <label htmlFor="hairColor" className={labelClass}>{t('search.hairColor') || 'Hair Color'}</label>
                    <select
                      id="hairColor"
                      value={displayValues.hairColor}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        setDisplayValues({ ...displayValues, hairColor: value });
                        setFilters({ ...filters, hairColor: value === 'any' ? '' : value });
                      }}
                      className={inputClass}
                    >
                      <option value="any">Any</option>
                      {hairColors.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 text-start">
                    <label htmlFor="dateMissing" className={labelClass}>{t('search.dateMissing') || 'Date Went Missing'}</label>
                    <div className="relative">
                      <input
                        id="dateMissing"
                        type="date"
                        ref={dateInputRef}
                        value={filters.dateMissing}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, dateMissing: e.target.value })}
                        className={`${inputClass} ${isRTL ? 'pl-10' : 'pr-10'}`}
                      />
                      <div
                        onClick={() => {
                          const input = dateInputRef.current;
                          if (input) {
                            input.focus();
                            if ('showPicker' in input) {
                              if ('showPicker' in input && typeof input.showPicker === 'function') {
                                input.showPicker();
                              }
                            }
                          }
                        }}
                        className={`absolute top-1/2 -translate-y-1/2 cursor-pointer z-10 p-2 rounded-full hover:bg-gray-200 transition-colors ${
                          isRTL ? 'left-1' : 'right-1'
                        }`}
                      >
                        <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-start">
                    <label htmlFor="city" className={labelClass}>{t('search.city') || 'City'}</label>
                    <select
                      id="city"
                      value={displayValues.city}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        setDisplayValues({ ...displayValues, city: value });
                        setFilters({ ...filters, city: value === 'any' ? '' : value });
                      }}
                      className={inputClass}
                    >
                      <option value="any">Any</option>
                      {(isRTL ? EGYPTIAN_CITIES_AR : EGYPTIAN_CITIES).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 text-start">
                    <label htmlFor="location" className={labelClass}>{t('search.location') || 'Location details'}</label>
                    <input
                      id="location"
                      placeholder={t('search.locationPlaceholder') || 'Enter specific location...'}
                      value={filters.location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, location: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Row 6 */}
                <div className="space-y-2 text-start">
                  <label htmlFor="clothing" className={labelClass}>{t('search.clothing') || 'Clothing Description'}</label>
                  <textarea
                    id="clothing"
                    placeholder={t('search.clothingPlaceholder') || 'Describe what they were wearing...'}
                    value={filters.clothing}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFilters({ ...filters, clothing: e.target.value })}
                    className={`flex min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50/50 resize-y`}
                  />
                </div>
              </div>

              <Button onClick={handleCombinedSearch} className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold cursor-pointer transition-colors duration-300 py-6 text-base shadow-md" size="lg">
                <Search className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
                {t('search.searchButton') || 'Search'}
              </Button>

              <div className="p-4 bg-primary/20 border border-primary/40 rounded-lg flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-sm text-slate-700 text-start mt-0.5 leading-relaxed">
                  <strong>{t('search.tipLabel') || 'Pro Tip:'}</strong> {t('search.tipText') || 'Providing multiple filters helps narrow down the results effectively.'}
                </p>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="mb-10">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('missing')}
                className={`py-3 px-8 text-sm sm:text-base font-bold transition-all duration-300 relative cursor-pointer ${
                  activeTab === 'missing' ? 'text-tertiary' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Missing Reports
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
                Found Persons
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
                <Search className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>No {activeTab} reports found matching these criteria.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}