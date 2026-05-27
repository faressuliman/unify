import { useState } from "react";
import { useMap } from "react-leaflet";
import { X, Calendar, User, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import MissingModal from "../ui/modals/MissingModal";
import FoundModal from "../ui/modals/FoundModal";
import { type BackendMapMarker } from "../../lib/api";
import type { ProfileData } from "../home/PersonCard";

const extractAge = (age: number | string, details?: string): string => {
  if (age != null && age !== "") return String(age);
  if (!details) return "";
  const match = details.match(/(\d+)/);
  return match ? match[1] : "";
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
    status: post.status ?? "active",
    location: post.location ?? post.address ?? post.city ?? "",
    timeAgo:
      post.timeAgo ??
      (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""),
    details: post.details ?? "",
    age: post.age ? String(post.age) : undefined,
    clothingDescription: post.clothesDescription,
    city: post.city,
    postedBy: post.postedBy,
    reportDate: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString()
      : undefined,
  };

  return (
    <>
      <div
        className="font-sans flex flex-col gap-0 w-full"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header Area */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1.5 text-start pr-4 rtl:pr-0 rtl:pl-4">
            <span
              className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${post.type === "missing" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
            >
              {post.type === "missing"
                ? isRTL
                  ? "مفقود"
                  : "Missing"
                : isRTL
                  ? "معثور عليه"
                  : "Found"}
            </span>
            <h3 className="font-extrabold text-slate-800 text-lg leading-tight line-clamp-2">
              {post.name}
            </h3>
          </div>
          <button
            type="button"
            aria-label={isRTL ? "إغلاق" : "Close"}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-7 h-7 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              map.closePopup();
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Area */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-blue-500 shrink-0 shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 text-start flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {post.type === "missing" ? t.dateLost : t.dateFound || "Date"}
              </span>
              <span className="font-semibold text-sm text-slate-700 truncate">
                {post.lastSeenDate
                  ? new Date(post.lastSeenDate).toLocaleDateString()
                  : post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : post.timeAgo || t.notProvided}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-amber-500 shrink-0 shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 text-start flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {t.currentAge}
              </span>
              <span className="font-semibold text-sm text-slate-700 truncate">
                {extractAge(post.age ?? "", post.details) || "?"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-emerald-500 shrink-0 shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 text-start flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {t.homeAddress || "Address"}
              </span>
              <span className="font-semibold text-sm text-slate-700 line-clamp-1">
                {post.address || post.city || post.location || t.notProvided}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          aria-label={t.viewDetails}
          onClick={() => setIsModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-bold py-2.5 rounded-xl text-sm shadow-md shadow-secondary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          {t.viewDetails}
          {isRTL ? (
            <ArrowLeft className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {post.type === "missing" ? (
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
