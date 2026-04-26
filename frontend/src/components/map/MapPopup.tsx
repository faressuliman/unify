import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { X } from 'lucide-react';
import MissingModal from '../ui/modals/MissingModal';
import FoundModal from '../ui/modals/FoundModal';
import { type BackendMapMarker } from '../../lib/api';
import type { ProfileData } from '../home/PersonCard';

const extractAge = (age: number | string, details?: string): string => {
  if (age) return String(age);
  if (!details) return '';
  const match = details.match(/(\d+)/);
  return match ? match[1] : '';
};

type MapPopupProps = {
  post: BackendMapMarker;
  isRTL: boolean;
  t: {
    dateLost?: string;
    dateFound?: string;
    notProvided?: string;
    currentAge?: string;
    homeAddress?: string;
    viewDetails?: string;
  };
};

export default function MapPopup({ post, isRTL, t }: MapPopupProps) {
  const map = useMap();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalProfile: ProfileData = {
    id: post.id,
    type: post.type,
    name: post.name,
    status: post.status ?? 'active',
    location: post.location ?? post.address ?? post.city ?? '',
    timeAgo: post.timeAgo ?? (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''),
    details: post.details ?? '',
    age: post.age ? String(post.age) : undefined,
    city: post.city,
    reportDate: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : undefined,
  };

  return (
    <>
      <div className="font-sans flex flex-col gap-3 p-1" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-tertiary text-base m-0 text-start">{post.name}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              map.closePopup();
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-end bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium text-xs break-keep whitespace-nowrap">
              {post.type === 'missing' ? t.dateLost : t.dateFound || 'Date'} :
            </span>
            <span className="font-semibold text-slate-800 leading-tight flex-1 text-end">
              {post.lastSeenDate ? new Date(post.lastSeenDate).toLocaleDateString() : post.createdAt ? new Date(post.createdAt).toLocaleDateString() : post.timeAgo || t.notProvided}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium text-xs break-keep whitespace-nowrap">{t.currentAge} :</span>
            <span className="font-semibold text-slate-800 flex-1 text-end">{extractAge(post.age ?? '', post.details) || '?'}</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-slate-400 font-medium text-xs break-keep whitespace-nowrap">{t.homeAddress || 'Address'} :</span>
            <span className="font-semibold text-slate-800 leading-tight flex-1 text-end">{post.address || post.city || post.location}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-1 bg-gray-200 hover:bg-gray-300 text-tertiary font-bold py-2 rounded-xl text-sm transition-colors cursor-pointer"
        >
          {t.viewDetails}
        </button>
      </div>

      {post.type === 'missing' ? (
        <MissingModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          profile={modalProfile}
          isRTL={isRTL}
        />
      ) : (
        <FoundModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          profile={modalProfile}
          isRTL={isRTL}
        />
      )}
    </>
  );
}
