import { type FormEvent, useMemo, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ShieldCheck, HeartHandshake, ShieldAlert } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import FormTextArea from '@/components/ui/FormTextArea';
import SubmitButton from '@/components/ui/SubmitButton';
import { en } from '../../../data/english';
import { ar } from '../../../data/arabic';
import { claimApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ClaimFamilyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  postId?: string;
  isRTL: boolean;
}

export default function ClaimFamilyModal({ isOpen, onOpenChange, personName, postId, isRTL }: ClaimFamilyModalProps) {
  const t = isRTL ? ar.recentUpdates.foundModal : en.recentUpdates.foundModal;
  const { token } = useAuth();
  const [relationship, setRelationship] = useState('');
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSubmitAttempted(false);
    }
    onOpenChange(open);
  };

  const relationshipError = useMemo(
    () => submitAttempted && relationship.trim().length < 15,
    [submitAttempted, relationship]
  );
  const documentError = useMemo(
    () => submitAttempted && !documentImage,
    [submitAttempted, documentImage]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (relationship.trim().length < 15 || !documentImage || !postId || !token) {
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('postId', postId);
      formData.append('claimType', 'family_reunion');
      formData.append('additionalInfo', relationship);
      formData.append('document', documentImage);
      formData.append('authorization', token);
      
      await claimApi.createClaim(formData, token);
      
      toast.success(isRTL ? 'تم ارسال الطلب بنجاح' : 'Claim submitted successfully');
      onOpenChange(false);
      setRelationship('');
      setDocumentImage(null);
      setSubmitAttempted(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-slate-950/40 modal-overlay" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-71 w-[calc(100%-1.25rem)] h-[95vh] max-h-[95vh] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col focus:outline-hidden modal-pop"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="modal-panel flex h-full min-h-0 flex-col">
          {/* Header */}
          <div className="relative z-10 px-5 pt-7 pb-5 sm:px-8 border-b border-slate-100 bg-slate-50/50">
            <div className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} z-20`}>
              <DialogPrimitive.Close className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/50 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex items-start justify-start gap-4 sm:gap-5">
              <div className="flex h-13 w-13 mt-0.5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-secondary shadow-inner">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div className="pe-8 pt-0.5">
                <DialogPrimitive.Title className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.claimTitle}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-[13px] font-medium leading-relaxed text-slate-500">
                  {t.claimSubtitle.replace('{name}', personName)}
                </DialogPrimitive.Description>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:p-6 transition-colors hover:border-slate-200 focus-within:border-primary-200 focus-within:bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs font-black shadow-sm">1</span>
                  <label className="text-base font-bold text-slate-900">{t.relationshipLabel}</label>
                </div>
                <FormTextArea
                  id="claim-relationship"
                  label={null}
                  value={relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                  placeholder={t.relationshipPlaceholder}
                  className="min-h-32 rounded-xl border-slate-200 bg-white p-4 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:ring-primary-100 resize-none"
                />
                <p className="mt-3 text-[13px] font-medium text-slate-500 ms-1">{t.relationshipHelp}</p>
                {relationshipError && <p className="mt-2 mx-1 text-[13px] font-bold text-red-500 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4"/> {t.relationshipError}</p>}
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:p-6 transition-colors hover:border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs font-black shadow-sm">2</span>
                  <label className="text-base font-bold text-slate-900">{t.documentLabel}</label>
                </div>
                <div className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-sm">
                  <ImageUpload
                    onImageChange={setDocumentImage}
                    title={t.documentTitle}
                    dragDropText=""
                    subtitle={t.documentHint}
                    buttonText={t.documentButton}
                    changeText={t.documentChange}
                    removeText={t.documentRemove}
                  />
                </div>
                {documentError && <p className="mt-3 mx-1 text-[13px] font-bold text-red-500 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4"/> {t.documentError}</p>}
              </div>

              {/* Notice */}
              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/60 bg-amber-50/50 px-5 py-4">
                <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                <span className="text-[14px] font-medium text-amber-800/90 leading-relaxed pt-0.5">{t.claimNotice}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col lg:flex-row gap-3 pt-2">
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full lg:flex-1 px-8 text-[15px] bg-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-blue-700 order-1 lg:order-2"
                >
                  {t.submitClaim}
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="flex h-14 w-full lg:flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-[15px] font-bold text-slate-700 cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] order-2 lg:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}