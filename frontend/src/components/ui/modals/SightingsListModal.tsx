import { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { X, Eye, MapPin, Phone, User as UserIcon, Loader2, Inbox, Clock, Shirt, Info, MessageCircle } from 'lucide-react';
import { sightingApi, type BackendSighting } from '@/lib/api';

interface SightingsListModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postName: string;
  isRTL: boolean;
  token: string;
  highlightSightingId?: string | null;
}

const CONFIDENCE_LABELS: Record<string, { en: string; ar: string; tone: string }> = {
  not_sure: { en: 'Not sure', ar: 'لست متأكدًا', tone: 'bg-slate-100 text-slate-700 border border-slate-200' },
  possibly: { en: 'Possibly', ar: 'ربما', tone: 'bg-orange-50 text-orange-700 border border-orange-200' },
  pretty_sure: { en: 'Pretty sure', ar: 'متأكد إلى حد ما', tone: 'bg-blue-50 text-blue-700 border border-blue-200' },
  very_sure: { en: 'Very sure', ar: 'متأكد جدًا', tone: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
};

export default function SightingsListModal({
  isOpen,
  onOpenChange,
  postId,
  postName,
  isRTL,
  token,
  highlightSightingId = null,
}: SightingsListModalProps) {
  const [sightings, setSightings] = useState<BackendSighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLLIElement | null>(null);
  const navigate = useNavigate();

  const handleOpenChat = (reporterId?: string | { _id: string }) => {
    const id = typeof reporterId === 'object' ? reporterId?._id : reporterId;
    if (!id) return;
    navigate(`/chat?chatWith=${encodeURIComponent(id)}`);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!isOpen || !postId || !token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await sightingApi.getSightings(postId, token);
        setSightings(res.reports || []);
      } catch (err) {
        const e = err as Error;
        setError(e.message || (isRTL ? 'فشل تحميل المشاهدات' : 'Failed to load sightings'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isOpen, postId, token, isRTL]);

  useEffect(() => {
    if (!isOpen || !highlightSightingId) return;
    const timer = window.setTimeout(() => {
      highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isOpen, highlightSightingId, sightings.length]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-slate-950/40 modal-overlay" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-71 w-[calc(100%-1.25rem)] max-h-[90vh] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col focus:outline-none modal-pop"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="modal-panel flex h-full min-h-0 flex-col">
            <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <div className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'}`}>
                    <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 transition-colors hover:bg-slate-200">
                      <X className="h-4 w-4" />
                    </DialogPrimitive.Close>
                  </div>
                  <div className="flex items-start gap-3 pe-10">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-secondary">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                        {isRTL ? 'تقارير المشاهدة' : 'Sighting Reports'}
                      </DialogPrimitive.Title>
                      <DialogPrimitive.Description className="text-sm text-slate-500 mt-0.5">
                        {isRTL ? `للحالة: ${postName}` : `For: ${postName}`}
                      </DialogPrimitive.Description>
                    </div>
                  </div>
                </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
                  {loading ? (
                    <div className="py-12 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                    </div>
                  ) : error ? (
                    <div className="py-12 text-center text-red-600">{error}</div>
                  ) : sightings.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p>{isRTL ? 'لا توجد بلاغات مشاهدة بعد.' : 'No sightings reported yet.'}</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {sightings.map((s) => {
                        const conf = CONFIDENCE_LABELS[s.confidence] || CONFIDENCE_LABELS.not_sure;
                        const isHighlighted = highlightSightingId === s._id;
                        const reporterId = typeof s.reporterId === 'object' ? s.reporterId?._id : s.reporterId;
                        return (
                          <li
                            key={s._id}
                            ref={isHighlighted ? highlightedRef : undefined}
                            className={`rounded-2xl p-5 transition-all duration-300 relative overflow-hidden ${
                              isHighlighted
                                ? 'border-2 border-secondary bg-secondary/[0.03] shadow-[0_0_0_4px_rgba(0,0,0,0.02)]'
                                : 'border border-slate-200 bg-white shadow-sm hover:shadow-md'
                            }`}
                          >
                            {/* Top row: Confidence badge and timestamp */}
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100/80">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {isRTL ? 'مستوى التأكد' : 'Confidence'}
                                </span>
                                <span className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm w-fit ${conf.tone}`}>
                                  {isRTL ? conf.ar : conf.en}
                                </span>
                              </div>
                              <div className="text-right flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {isRTL ? 'تاريخ المشاهدة' : 'Date Seen'}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                  <Clock className="h-4 w-4 text-secondary/70 shrink-0" />
                                  <span>{s.seenAt}</span>
                                </div>
                              </div>
                            </div>

                            {/* Middle details mapping */}
                            <div className="space-y-4 mb-5">
                              {s.location?.address && (
                                <div>
                                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    {isRTL ? 'الموقع' : 'Location'}
                                  </span>
                                  <p className="text-sm font-medium text-slate-800 rtl:pr-5 ltr:pl-5">
                                    {s.location.address}
                                  </p>
                                </div>
                              )}

                              <div>
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                                  <Shirt className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  {isRTL ? 'الملابس والمظهر' : 'Clothing & Appearance'}
                                </span>
                                <p className="text-sm text-slate-700 rtl:pr-5 ltr:pl-5 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                  {s.description}
                                </p>
                              </div>

                              {s.additionalDetails && (
                                <div>
                                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                                    <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    {isRTL ? 'تفاصيل إضافية' : 'Additional Info'}
                                  </span>
                                  <p className="text-sm text-slate-600 rtl:pr-5 ltr:pl-5 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    {s.additionalDetails}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Bottom row: Reporter info */}
                            <div className="bg-slate-50/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-slate-200/60 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                  <UserIcon className="h-4 w-4 text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                    {isRTL ? 'المُبلّغ' : 'Reported By'}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800">
                                    {s.reporterName}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                  <Phone className="h-3.5 w-3.5 text-secondary" />
                                  <a
                                    href={`tel:${s.reporterPhone}`}
                                    className="text-sm font-bold text-slate-700 hover:text-secondary transition-colors"
                                    dir="ltr"
                                  >
                                    {s.reporterPhone}
                                  </a>
                                </div>
                                {reporterId && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenChat(reporterId)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-secondary bg-secondary px-3 py-1.5 text-sm font-bold text-white hover:bg-secondary/90 transition-colors cursor-pointer"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5 text-white" />
                                    {isRTL ? 'فتح محادثة' : 'Open chat'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
