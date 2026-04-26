import { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, MapPin, Phone, User as UserIcon, Calendar, Loader2, Inbox } from 'lucide-react';
import { sightingApi, type BackendSighting } from '@/lib/api';

interface SightingsListModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postName: string;
  isRTL: boolean;
  token: string;
}

const CONFIDENCE_LABELS: Record<string, { en: string; ar: string; tone: string }> = {
  not_sure: { en: 'Not sure', ar: 'لست متأكدًا', tone: 'bg-slate-100 text-slate-700' },
  possibly: { en: 'Possibly', ar: 'ربما', tone: 'bg-amber-50 text-amber-700' },
  pretty_sure: { en: 'Pretty sure', ar: 'متأكد إلى حد ما', tone: 'bg-blue-50 text-blue-700' },
  very_sure: { en: 'Very sure', ar: 'متأكد جدًا', tone: 'bg-green-50 text-green-700' },
};

export default function SightingsListModal({
  isOpen,
  onOpenChange,
  postId,
  postName,
  isRTL,
  token,
}: SightingsListModalProps) {
  const [sightings, setSightings] = useState<BackendSighting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-70 bg-slate-950/40"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                className="fixed left-1/2 top-1/2 z-71 w-[calc(100%-1.25rem)] max-h-[90vh] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col focus:outline-none"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
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
                        return (
                          <li
                            key={s._id}
                            className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${conf.tone}`}>
                                {isRTL ? conf.ar : conf.en}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(s.seenAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {s.location?.address && (
                              <p className="flex items-start gap-1.5 text-sm text-slate-700 mb-1.5">
                                <MapPin className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                                <span>{s.location.address}</span>
                              </p>
                            )}
                            <p className="text-sm text-slate-700 mb-2">{s.description}</p>
                            {s.additionalDetails && (
                              <p className="text-xs text-slate-500 mb-2 italic">
                                {s.additionalDetails}
                              </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100/80">
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                                {s.reporterName}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                <a
                                  href={`tel:${s.reporterPhone}`}
                                  className="hover:text-secondary transition-colors"
                                  dir="ltr"
                                >
                                  {s.reporterPhone}
                                </a>
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
