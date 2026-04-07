import { motion } from 'framer-motion';
import { MapPin, Clock, User } from 'lucide-react';
import { en } from '../../data/english';
import { ar } from '../../data/arabic';
import type { ProfileData } from '../home/PersonCard';

interface FoundPersonCardProps {
  profile: ProfileData;
  idx: number;
  isRTL: boolean;
  showImage?: boolean;
  className?: string;
}

export default function FoundPersonCard({ profile, idx, isRTL, showImage = false, className = '' }: FoundPersonCardProps) {
  const t = isRTL ? ar.recentUpdates : en.recentUpdates;

  return (
    <motion.div 
      key={profile.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className={`flex-none w-[calc(85%-0.5rem)] md:w-[calc(45%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] snap-start group bg-white rounded-lg border border-primary-300 overflow-hidden shadow-sm ${className}`}
    >
      <div className="relative h-48 sm:h-52 overflow-hidden bg-[#faf9f5]">
        <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} z-10`}>
          <div className={`bg-primary text-[#1c190d] text-[10px] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 uppercase tracking-widest shadow-sm ${isRTL ? 'rounded-br-lg' : 'rounded-bl-lg'}`}>
            {profile.status}
          </div>
        </div>
        
        {showImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url("${profile.image || 'https://via.placeholder.com/400x300?text=No+Image'}")` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="w-28 h-28 bg-secondary-dark rounded-full blur-2xl transition-transform duration-500"></div>
            <div className="absolute w-32 h-40 bg-[#d0c9a8]/40 rounded-t-full blur-2xl top-1/2 translate-y-4 transition-transform duration-500"></div>
            <div className="absolute inset-0 backdrop-blur-sm bg-[#faf9f5]/20"></div>
          </div>
        )}

        <div className={`absolute inset-0 ${showImage ? 'bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-100' : 'bg-linear-to-t from-white via-transparent to-transparent opacity-80'}`}></div>
      </div>
      
      <div className="p-4 sm:p-5 flex flex-col h-[calc(100%-12rem)] sm:h-[calc(100%-13rem)] min-h-45 justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base sm:text-lg font-bold text-tertiary truncate" title={profile.name}>
              {profile.name}
            </h3>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 mb-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">{profile.timeAgo}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">{profile.details}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-auto">
          <button className="w-full bg-slate-100 text-slate-700 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors duration-300 cursor-pointer whitespace-nowrap">
            {t.buttons.details}
          </button>
        </div>
      </div>
    </motion.div>
  );
}