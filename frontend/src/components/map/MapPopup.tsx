import { useNavigate } from 'react-router-dom';
import { useMap } from 'react-leaflet';
import { X } from 'lucide-react';
import type { MissingPerson } from '../../data/mockData';

const extractAge = (details: string): string => {
  const match = details.match(/(\d+)/);
  return match ? match[1] : '';
};

type MapPopupProps = {
  post: MissingPerson;
  isRTL: boolean;
  t: any;
};

export default function MapPopup({ post, isRTL, t }: MapPopupProps) {
  const map = useMap();
  const navigate = useNavigate();

  return (
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
          <span className="text-slate-400 font-medium text-xs break-keep whitespace-nowrap">{t.dateLost} :</span>
          <span className="font-semibold text-slate-800 leading-tight flex-1 text-end">{post.timeAgo || t.notProvided}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-medium text-xs break-keep whitespace-nowrap">{t.currentAge} :</span>
          <span className="font-semibold text-slate-800 flex-1 text-end">{extractAge(post.details) || '?'}</span>
        </div>
        <div className="flex items-start gap-4">
          <span className="text-slate-400 font-medium text-xs break-keep whitespace-nowrap">{t.homeAddress} :</span>
          <span className="font-semibold text-slate-800 leading-tight flex-1 text-end">{post.location}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/search')}
        className="w-full mt-1 bg-gray-200 hover:bg-gray-300 text-tertiary font-bold py-2 rounded-xl text-sm transition-colors cursor-pointer"
      >
        {t.viewDetails}
      </button>
    </div>
  );
}
