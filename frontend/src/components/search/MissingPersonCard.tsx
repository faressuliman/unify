import { motion } from 'framer-motion';
import { Lock, MapPin, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { en } from '../../data/english';
import { ar } from '../../data/arabic';
import type { ProfileData } from '../home/PersonCard';
import MissingModal from '../ui/modals/MissingModal';
import { directionFor } from '../../lib/textDirection';
import { toArabicDisplay, toRTLDisplay } from '../../lib/transliterate';

interface MissingPersonCardProps {
  profile: ProfileData;
  idx: number;
  isRTL: boolean;
  showImage?: boolean;
  className?: string;
}

export default function MissingPersonCard({ profile, idx, isRTL, showImage = false, className = '' }: MissingPersonCardProps) {
  const t = isRTL ? ar.recentUpdates : en.recentUpdates;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div 
        key={profile.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className={`flex-none w-[calc(85%-0.5rem)] md:w-[calc(45%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] snap-start group bg-white rounded-lg border border-primary-300 overflow-hidden shadow-sm ${className}`}
    >
      <div className="relative h-48 sm:h-52 overflow-hidden rounded-t-lg">
        {showImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url("${profile.image || 'https://via.placeholder.com/400x300?text=No+Image'}")` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#1a1f35]">
            {/* Ambient glow blobs */}
            <div className="absolute w-40 h-40 bg-secondary/25 rounded-full blur-3xl -top-4 -left-4 pointer-events-none" />
            <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl bottom-0 right-0 pointer-events-none" />
            {/* Lock icon */}
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 shadow-[0_0_24px_rgba(212,180,74,0.25)] mb-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            {/* Label */}
            <p className="relative z-10 text-[11px] sm:text-xs font-bold tracking-widest uppercase text-primary/90">
              {isRTL ? 'الصورة محمية' : 'Photo Protected'}
            </p>
            <p className="relative z-10 text-[10px] text-white/40 mt-1 font-medium">
              {isRTL ? 'للمستخدمين المصرح لهم فقط' : 'Authorized users only'}
            </p>
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-5 flex flex-col h-[calc(100%-12rem)] sm:h-[calc(100%-13rem)] min-h-45 justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-base sm:text-lg font-bold text-tertiary truncate"
              title={profile.name}
              dir={isRTL ? 'rtl' : directionFor(profile.name)}
            >
              {toArabicDisplay(profile.name, isRTL)}
            </h3>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 mb-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate" dir={isRTL ? 'rtl' : 'ltr'}>{toRTLDisplay(profile.location, isRTL)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">{profile.timeAgo}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate" dir={directionFor(profile.details)}>{profile.details}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-slate-100 text-slate-700 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors duration-300 cursor-pointer whitespace-nowrap"
          >
            {t.buttons.details}
          </button>
        </div>
      </div>
    </motion.div>

      <MissingModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        profile={profile}
        isRTL={isRTL}
      />
    </>
  );
}