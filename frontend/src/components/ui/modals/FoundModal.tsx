import { type ReactNode, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Calendar,
  Lock,
  MapPin,
  Paintbrush,
  ShieldAlert,
  Shirt,
  User,
  UserRound,
  X,
} from 'lucide-react';
import { en } from '../../../data/english';
import { ar } from '../../../data/arabic';
import type { ProfileData } from '../../home/PersonCard';
import ClaimFamilyModal from './ClaimFamilyModal';
import SubmitButton from '../SubmitButton';

interface FoundModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData;
  isRTL: boolean;
}

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}

function InfoCard({ icon, label, value, fullWidth = false }: InfoCardProps) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-100/80 transition-shadow hover:shadow-xs hover:border-slate-200 ${fullWidth ? 'sm:col-span-2' : 'col-span-1'}`}>
      <div className="flex items-center gap-2.5 text-slate-500">
        <span className="text-secondary/80">{icon}</span>
        <span className="text-[13px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-base font-semibold text-slate-800 leading-relaxed wrap-break-word">{value}</p>
    </div>
  );
}

const getFallbackAge = (details: string, fallback: string) => {
  const match = details.match(/(\d+\s*(?:years old|year old))/i);
  return match ? match[1] : fallback;
};

export default function FoundModal({ isOpen, onOpenChange, profile, isRTL }: FoundModalProps) {
  const t = isRTL ? ar.recentUpdates.foundModal : en.recentUpdates.foundModal;
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  const protectedName = profile.name || t.unknown;
  const age = profile.age || getFallbackAge(profile.details, t.unknown);
  const physicalDescription = profile.physicalDescription || profile.details;
  const clothingDescription = profile.clothingDescription || t.notAvailable;
  const foundLocation = profile.foundLocationDetails || profile.location;
  const city = profile.city || t.notAvailable;
  const postedBy = profile.postedBy || t.authorizedTeam;
  const reportDate = profile.reportDate || t.notAvailable;

  return (
    <>
      <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-60 bg-slate-950/40 modal-overlay" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-61 h-[95vh] sm:h-auto max-h-[95vh] w-[calc(100%-1.25rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/50 bg-white shadow-2xl focus:outline-hidden modal-pop"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="modal-panel">
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(202,138,4,0.6)]"></span>
                  <DialogPrimitive.Description className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {t.foundReport}
                  </DialogPrimitive.Description>
                </div>
                <DialogPrimitive.Title className="text-xl sm:text-2xl font-black text-slate-900">
                  {protectedName}
                </DialogPrimitive.Title>
              </div>
              <DialogPrimitive.Close className="rounded-full bg-slate-100/80 p-2.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-6 sm:space-y-8 p-5 sm:p-8">
              {/* Image Protection Area */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-4 py-12 sm:py-16 flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                <div className="absolute inset-0 bg-linear-to-br from-slate-900 to-slate-800"></div>

                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.45)] border border-slate-700/50 mb-5">
                  <Lock className="h-8 w-8 text-slate-300" />
                </div>

                <div className="relative z-10 flex max-w-sm flex-col items-center text-center gap-2">
                  <span className="text-[22px] font-black tracking-wide text-white">
                    {t.photoProtected}
                  </span>
                  <span className="text-[14px] font-medium leading-relaxed text-slate-400">
                    {t.photoVisibleAfterVerification}
                  </span>
                </div>

                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/90 border border-white/10">
                    {profile.status}
                  </span>
                </div>
              </div>

              {/* Information Grid Container */}
              <div className="flex flex-col gap-6">
                {/* Personal & Appearance Segment */}
                <div className="space-y-3">
                  <h4 className="text-[13px] font-bold uppercase tracking-widest text-slate-400 ms-1">Personal Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoCard icon={<UserRound className="h-4.5 w-4.5" />} label={t.age} value={age} />
                    <InfoCard icon={<User className="h-4.5 w-4.5" />} label={t.postedBy} value={postedBy} />
                    <InfoCard icon={<Paintbrush className="h-4.5 w-4.5" />} label={t.physicalDescription} value={physicalDescription} fullWidth />
                    <InfoCard icon={<Shirt className="h-4.5 w-4.5" />} label={t.clothingDescription} value={clothingDescription} fullWidth />
                  </div>
                </div>

                {/* Location & Log Segment */}
                <div className="space-y-3">
                  <h4 className="text-[13px] font-bold uppercase tracking-widest text-slate-400 ms-1">Location Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoCard icon={<MapPin className="h-4.5 w-4.5" />} label={t.city} value={city} />
                    <InfoCard icon={<Calendar className="h-4.5 w-4.5" />} label={t.reportDate} value={reportDate} />
                    <InfoCard icon={<MapPin className="h-4.5 w-4.5" />} label={t.foundLocation} value={foundLocation} fullWidth />
                  </div>
                </div>
              </div>

              {/* Call to Action Container */}
              <div className="mt-8 space-y-4">
                <div className="rounded-[20px] bg-blue-50/60 p-5 sm:p-6 border border-blue-100/60">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <p className="text-[14px] sm:text-[15px] font-medium leading-relaxed text-blue-900/80">
                      {t.claimSummary}
                    </p>
                  </div>
                </div>
                <SubmitButton
                  type="button"
                  onClick={() => {
                    setIsClaimOpen(true);
                  }}
                  className="w-full px-6 text-[15px] sm:text-[16px]"
                >
                  {t.claimAsFamilyMember}
                </SubmitButton>
              </div>
            </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ClaimFamilyModal
        isOpen={isClaimOpen}
        onOpenChange={setIsClaimOpen}
        personName={protectedName}
        isRTL={isRTL}
      />
    </>
  );
}