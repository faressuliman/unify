import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ShieldCheck, Eye } from 'lucide-react';
import FormInput from '@/components/ui/FormInput';
import FormTextArea from '@/components/ui/FormTextArea';
import SelectMenu from '@/components/ui/SelectMenu';
import SubmitButton from '@/components/ui/SubmitButton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { en } from '../../../data/english';
import { ar } from '../../../data/arabic';

interface SightingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  isRTL: boolean;
}

export default function SightingModal({ isOpen, onOpenChange, personName, isRTL }: SightingModalProps) {
  const t = isRTL ? ar.recentUpdates.missingModal : en.recentUpdates.missingModal;
  
  const [formData, setFormData] = useState({
    confidence: '',
    date: '',
    location: '',
    wearing: '',
    additional: '',
    contactName: '',
    contactPhone: ''
  });
  
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSubmitAttempted(false);
    }
    onOpenChange(open);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validationRules = {
    confidence: formData.confidence !== '',
    date: formData.date.trim() !== '',
    location: formData.location.trim() !== '',
    wearing: formData.wearing.trim() !== '',
    contactName: formData.contactName.trim() !== '',
    contactPhone: formData.contactPhone.trim() !== ''
  };

  const errors = useMemo(() => {
    if (!submitAttempted) return {};
    const e: Record<string, string> = {};
    if (!validationRules.confidence) e.confidence = t.requiredError;
    if (!validationRules.date) e.date = t.requiredError;
    if (!validationRules.location) e.location = t.requiredError;
    if (!validationRules.wearing) e.wearing = t.requiredError;
    if (!validationRules.contactName) e.contactName = t.requiredError;
    if (!validationRules.contactPhone) e.contactPhone = t.requiredError;
    return e;
  }, [submitAttempted, validationRules, t]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const isValid = Object.values(validationRules).every(Boolean);
    if (!isValid) return;

    onOpenChange(false);
    setFormData({
      confidence: '',
      date: '',
      location: '',
      wearing: '',
      additional: '',
      contactName: '',
      contactPhone: ''
    });
    setSubmitAttempted(false);
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
                <Eye className="h-6 w-6" />
              </div>
              <div className="pe-8 pt-0.5">
                <DialogPrimitive.Title className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.sightingTitle}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-[13px] font-medium leading-relaxed text-slate-500">
                  {t.sightingSubtitle.replace('{name}', personName)}
                </DialogPrimitive.Description>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
              <div className="space-y-4">
                {/* Confidence */}
                <div>
                  <SelectMenu
                    id="sighting-confidence"
                    label={t.confidenceLabel}
                    value={formData.confidence}
                    options={[
                      { value: 'notSure', label: t.confidenceOptions.notSure },
                      { value: 'possibly', label: t.confidenceOptions.possibly },
                      { value: 'prettySure', label: t.confidenceOptions.prettySure },
                      { value: 'verySure', label: t.confidenceOptions.verySure }
                    ]}
                    onChange={(value) => setFormData(prev => ({ ...prev, confidence: value }))}
                    isRTL={isRTL}
                  />
                  <ErrorMessage msg={errors.confidence} className="text-xs" />
                </div>

                {/* Date/Time */}
                <div>
                  <FormInput
                    id="sighting-date"
                    name="date"
                    type="text"
                    label={t.dateLabel}
                    value={formData.date}
                    onChange={handleChange}
                    placeholder={t.datePlaceholder}
                  />
                  <ErrorMessage msg={errors.date} className="text-xs" />
                </div>

                {/* Location */}
                <div>
                  <FormInput
                    id="sighting-location"
                    name="location"
                    type="text"
                    label={t.locationLabel}
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={t.locationPlaceholder}
                  />
                  <ErrorMessage msg={errors.location} className="text-xs" />
                </div>

                {/* What were they wearing */}
                <div>
                  <FormInput
                    id="sighting-wearing"
                    name="wearing"
                    type="text"
                    label={t.wearingLabel}
                    value={formData.wearing}
                    onChange={handleChange}
                    placeholder={t.wearingPlaceholder}
                  />
                  <ErrorMessage msg={errors.wearing} className="text-xs" />
                </div>

                {/* Additional Details */}
                <div>
                  <FormTextArea
                    id="sighting-additional"
                    name="additional"
                    label={t.additionalLabel}
                    value={formData.additional}
                    onChange={handleChange}
                    placeholder={t.additionalPlaceholder}
                  />
                </div>

                {/* Contact Info */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Contact Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        id="sighting-contactName"
                        name="contactName"
                        type="text"
                        label={t.contactNameLabel}
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder={t.contactNamePlaceholder}
                      />
                      <ErrorMessage msg={errors.contactName} className="text-xs" />
                    </div>
                    <div>
                      <FormInput
                        id="sighting-contactPhone"
                        name="contactPhone"
                        type="text"
                        label={t.contactPhoneLabel}
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder={t.contactPhonePlaceholder}
                      />
                      <ErrorMessage msg={errors.contactPhone} className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="flex items-center gap-4 rounded-2xl border border-blue-200/60 bg-blue-50/50 px-5 py-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                <span className="text-[14px] font-medium text-blue-800/90 leading-relaxed">{t.sightingNotice}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col lg:flex-row gap-3 pt-2">
                <SubmitButton
                  type="submit"
                  className="w-full lg:flex-1 px-8 text-[15px] bg-red-600 shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:bg-red-700 order-1 lg:order-2"
                >
                  {t.submitSighting}
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex h-14 w-full lg:flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-[15px] font-bold text-slate-700 cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] order-2 lg:order-1"
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