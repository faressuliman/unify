import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Eye, HeartHandshake, Lock, UserRound, Paintbrush, Shirt } from 'lucide-react';
import { toArabicDisplay, toRTLDisplay } from '../../lib/transliterate';
import { directionFor } from '../../lib/textDirection';
import type { BackendPost } from '../../lib/api';
import SightingModal from '../ui/modals/SightingModal';
import ClaimFamilyModal from '../ui/modals/ClaimFamilyModal';
import { en } from '../../data/english';
import { ar } from '../../data/arabic';

import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface SpotlightMatchProps {
  profile: any; // Using any to access extended fields like physicalDescription
  rawPost: BackendPost & { confidence?: number };
  isRTL: boolean;
}

export default function SpotlightMatch({ profile, rawPost, isRTL }: SpotlightMatchProps) {
  const { isAuthenticated } = useAuth();
  const [isSightingOpen, setIsSightingOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  const t = isRTL ? ar.recentUpdates : en.recentUpdates;

  const protectedName = toArabicDisplay(profile.name || (isRTL ? 'غير معروف' : 'Unknown'), isRTL);
  const location = toRTLDisplay(profile.location, isRTL);
  
  const physicalDesc = profile.physicalDescription || (isRTL ? 'غير متوفر' : 'Not available');
  const clothingDesc = profile.clothingDescription || (isRTL ? 'غير متوفر' : 'Not available');
  const postedBy = profile.postedBy || (isRTL ? 'غير معروف' : 'Unknown');
  const genderText = isRTL 
    ? (rawPost.gender === 'male' ? 'ذكر' : rawPost.gender === 'female' ? 'أنثى' : 'غير معروف') 
    : (rawPost.gender === 'male' ? 'Male' : rawPost.gender === 'female' ? 'Female' : 'Unknown');

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-2xl border border-secondary/30 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col lg:flex-row relative group lg:h-[450px] xl:h-[500px]"
      >

        {/* Image Section */}
        <div className="relative w-full lg:w-5/12 xl:w-1/2 h-72 lg:h-full bg-slate-900 shrink-0">
          {profile.image ? (
            <>
              <img 
                src={profile.image} 
                alt={profile.name}
                className="w-full h-full object-contain sm:object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
              <Lock className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {isRTL ? 'صورة محمية' : 'Photo Protected'}
              </p>
            </div>
          )}
          
          <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
            <span className="rounded-lg bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              {profile.status}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <div className="flex items-start justify-between mb-4 shrink-0">
            <h3 
              className="text-2xl sm:text-3xl font-black text-slate-800"
              dir={directionFor(protectedName)}
            >
              {protectedName}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 mb-6 text-slate-600 shrink-0">
            {/* Left Column */}
            <div className="flex flex-col gap-y-6">
              {/* Age & Gender - FIRST */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <UserRound className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col overflow-hidden items-start">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{isRTL ? 'العمر والجنس' : 'Age & Gender'}</span>
                  <span className="text-sm font-medium truncate w-full text-start">{profile.age ? `${profile.age} • ${genderText}` : genderText}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col overflow-hidden items-start">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{isRTL ? 'الموقع' : 'Location'}</span>
                  <span className="text-sm font-medium truncate w-full text-start" dir={isRTL ? 'rtl' : 'ltr'} title={location}>{location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col overflow-hidden items-start">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{isRTL ? 'تاريخ التقرير' : 'Report Date'}</span>
                  <span className="text-sm font-medium truncate w-full text-start">{profile.reportDate || t.missingModal?.notAvailable}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Paintbrush className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col items-start w-full">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{isRTL ? 'الوصف الجسدي' : 'Physical Description'}</span>
                  <span className="text-sm font-medium text-start">{physicalDesc}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Shirt className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col items-start w-full">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{isRTL ? 'الملابس' : 'Clothing'}</span>
                  <span className="text-sm font-medium text-start">{clothingDesc}</span>
                </div>
              </div>
            </div>

            {/* Right Column - ONLY POSTED BY */}
            <div className="flex flex-col gap-y-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex flex-col overflow-hidden items-start">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{isRTL ? 'بواسطة' : 'Posted By'}</span>
                  <span className="text-sm font-medium truncate w-full text-start" title={postedBy}>{postedBy}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 shrink-0">
            {profile.type === 'found' ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error(isRTL ? 'يجب عليك تسجيل الدخول أولاً!' : 'You are required to login first!');
                    return;
                  }
                  setIsClaimOpen(true);
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-secondary text-white font-bold text-[15px] hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <HeartHandshake className="w-5 h-5" />
                {isRTL ? 'المطالبة كفرد من العائلة' : 'Claim as Family Member'}
              </button>
            ) : (
              <button
                onClick={() => setIsSightingOpen(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-secondary text-white font-bold text-[15px] hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Eye className="w-5 h-5" />
                {isRTL ? 'ربما رأيتهم' : 'I might have seen them'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {profile.type === 'missing' && (
        <SightingModal
          isOpen={isSightingOpen}
          onOpenChange={setIsSightingOpen}
          personName={protectedName}
          postId={profile.id}
          isRTL={isRTL}
        />
      )}

      {profile.type === 'found' && (
        <ClaimFamilyModal
          isOpen={isClaimOpen}
          onOpenChange={setIsClaimOpen}
          personName={protectedName}
          postId={profile.id}
          isRTL={isRTL}
        />
      )}
    </>
  );
}
