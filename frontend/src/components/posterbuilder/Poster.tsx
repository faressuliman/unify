import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faDownload, faImage } from '@fortawesome/free-solid-svg-icons';
import { UserCircle, Camera, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../ui/PageHeader';
import FormInput from '../ui/FormInput';
import FormTextArea from '../ui/FormTextArea';
import SubmitButton from '../ui/SubmitButton';
import ImageUpload from '../ui/ImageUpload';
import SegmentedControl from '../ui/SegmentedControl';
import SelectMenu from '../ui/SelectMenu';

const Poster = () => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState('');
  const [height, setHeight] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [clothing, setClothing] = useState('');
  const [contactType, setContactType] = useState<'mobile' | 'email'>('mobile');
  const [contact, setContact] = useState('');
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [pdfMessage, setPdfMessage] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  const ageUnitOptions = [
    { label: language === 'ar' ? 'اختر الوحدة' : 'Select Unit', value: '' },
    { label: language === 'ar' ? 'سنوات' : 'Years', value: 'years' },
    { label: language === 'ar' ? 'أشهر' : 'Months', value: 'months' },
    { label: language === 'ar' ? 'أيام' : 'Days', value: 'days' }
  ];

  const handleImageChange = (file: File | null) => {
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoDataUrl('');
    }
  };

  const previewImage = photoDataUrl || (photo ? URL.createObjectURL(photo) : '');

  const handleDownloadAction = async () => {
    const errors: string[] = [];
    if (!photoDataUrl) errors.push(t('poster.photoReq'));
    if (!fullName.trim()) errors.push(t('poster.nameReq'));
    if (!ageUnit) errors.push(language === 'ar' ? 'الوحدة مطلوبة' : 'Age unit is required');
    if (!age) errors.push(t('poster.ageReq'));
    if (!height) errors.push(t('poster.heightReq'));
    if (!lastSeen.trim()) errors.push(t('poster.locReq'));
    if (!clothing.trim()) errors.push(t('poster.clothReq'));
    if (!contact.trim()) errors.push(t('poster.contactReq'));

    if (errors.length > 0) {
      setPdfStatus('error');
      setPdfMessage(errors[0]);
      setTimeout(() => setPdfStatus('idle'), 3000);
      return;
    }

    try {
      setPdfStatus('processing');
      setPdfMessage(t('poster.genPdf'));
      if (!previewRef.current) return;
      await new Promise(r => setTimeout(r, 400));
      const imgData = await toJpeg(previewRef.current, { quality: 1.0, pixelRatio: 3 });

      // Size the PDF exactly to the poster element — no white bars
      const posterW = previewRef.current.offsetWidth;
      const posterH = previewRef.current.offsetHeight;
      const pdf = new jsPDF({
        orientation: posterH >= posterW ? 'p' : 'l',
        unit: 'px',
        format: [posterW, posterH],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, posterW, posterH, undefined, 'FAST');
      const fileName = fullName.trim() !== '' ? `${fullName.trim()}.pdf` : 'Missing_Person_Poster.pdf';
      pdf.save(fileName);
      setPdfStatus('done');
      setPdfMessage(t('poster.downloadStarted'));
      setTimeout(() => setPdfStatus('idle'), 3000);
    } catch {
      setPdfStatus('error');
      setPdfMessage(t('poster.errorOccurred'));
      setTimeout(() => setPdfStatus('idle'), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="bg-slate-50 py-8 print:bg-white print:py-0" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #poster-preview, #poster-preview * { visibility: visible !important; }
          #poster-preview {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="print:hidden">
          <PageHeader
            navigatedTo={t('poster.title')}
            title={t('poster.title')}
            subtitle={t('poster.subtitle')}
            showArrow={true}
            titleClassName={!isRTL ? 'tracking-[0.08em] sm:tracking-widest' : ''}
          />
        </motion.div>

        <div className="px-6 lg:px-12 w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start mt-6">
          <motion.div className="space-y-6 w-full lg:w-1/2 shrink-0 print:hidden pb-12" variants={itemVariants}>
            {/* Personal Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-secondary">
                  <UserCircle className="w-6 h-6" />
                </span>
                {t('poster.personalDetails')}
              </h2>

              <div className="space-y-4">
                <FormInput
                  id="fullName"
                  label={t('poster.fullName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('poster.fullNamePlaceholder')}
                  className="font-sans"
                />

                <div className="grid gap-4 font-sans">
                  <div className="flex flex-col gap-4">
                    <div>
                      <SelectMenu 
                          id="ageUnit"
                          label={language === 'ar' ? 'اختر وحدة العمر' : 'Select Age Unit'}
                          value={ageUnit}
                          options={ageUnitOptions}
                          onChange={(val) => {
                              setAgeUnit(val);
                              setAge(''); // clear age when unit changes to match CreatePost behavior
                          }}
                          isRTL={isRTL}
                      />
                    </div>
                    {ageUnit && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <FormInput
                          id="age"
                          label={
                            ageUnit === 'years' ? (language === 'ar' ? 'العمر (بالسنوات)' : 'Age (Years)') : 
                            ageUnit === 'months' ? (language === 'ar' ? 'العمر (بالأشهر)' : 'Age (Months)') : 
                            (language === 'ar' ? 'العمر (بالأيام)' : 'Age (Days)')
                          }
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={age}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val !== '') {
                                const num = Number(val);
                                if (ageUnit === 'years' && num > 90) return;
                                if (ageUnit === 'months' && num > 11) return;
                                if (ageUnit === 'days' && num > 30) return;
                            }
                            setAge(val);
                          }}
                          placeholder={t('poster.agePlaceholder')}
                          className="font-sans"
                        />
                      </motion.div>
                    )}
                  </div>

                  <FormInput
                    id="height"
                    label={t('poster.height')}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={height}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      if (val === '' || Number(val) <= 250) {
                        setHeight(val);
                      }
                    }}
                    placeholder={t('poster.heightPlaceholder')}
                    className={isRTL ? 'pl-14' : 'pr-14'}
                    suffix={
                      <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 ${isRTL ? 'left-4' : 'right-4'}`}>
                        {t('poster.heightUnit')}
                      </span>
                    }
                  />
                </div>

                <FormInput
                  id="lastSeen"
                  label={t('poster.lastSeen')}
                  value={lastSeen}
                  onChange={(e) => setLastSeen(e.target.value)}
                  placeholder={t('poster.lastSeenPlaceholder')}
                  className="font-sans"
                />
              </div>
            </div>

            {/* Photo Upload Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-secondary">
                  <Camera className="w-6 h-6" />
                </span>
                {t('poster.uploadPhoto')}
              </h2>

              <ImageUpload 
                onImageChange={handleImageChange}
                initialImage={photoDataUrl}
                title={t('poster.uploadPhoto')}
                dragDropText={t('poster.dragDrop')}
                subtitle={t('poster.uploadHint')} 
                buttonText={t('poster.browseFiles')} 
                changeText={t('poster.changePhoto')}
                removeText={t('poster.remove')}
              />
            </div>

            {/* Additional Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-secondary">
                  <FileText className="w-6 h-6" />
                </span>
                {t('poster.additionalInfo')}
              </h2>

              <div className="space-y-6">
                <FormTextArea
                  id="clothing"
                  label={t('poster.clothingDesc')}
                  value={clothing}
                  onChange={(e) => setClothing(e.target.value)}
                  placeholder={t('poster.clothingPlaceholder')}
                  rows={4}
                  className="resize-none py-3 text-base font-sans"
                />

                <div>
                  <label id="contactTips" className="mb-4 block text-start text-sm font-bold text-slate-600 font-sans">{t('poster.contactTips')}</label>
                  <SegmentedControl 
                    className="mb-4"
                    value={contactType}
                    onChange={(val) => { setContactType(val as 'mobile' | 'email'); setContact(''); }}
                    options={[
                      { value: 'mobile', label: t('poster.mobile') },
                      { value: 'email', label: t('poster.email') }
                    ]}
                  />
                  <div className="space-y-2 text-start">
                    <FormInput
                      id="contact"
                      label={null}
                      dir="ltr"
                      type={contactType === 'email' ? 'email' : 'tel'}
                      value={contact}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (contactType === 'mobile') {
                          value = value.replace(/[^\d+]/g, '').slice(0, 11);
                        }
                        setContact(value);
                      }}
                      placeholder={contactType === 'email' ? t('poster.emailPlaceholder') : t('poster.mobilePlaceholder')}
                      className="h-14 px-4 py-3 text-base sm:text-lg text-center font-bold tracking-wide font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>

            <SubmitButton
              type="button"
              disabled={pdfStatus === 'processing'}
              onClick={handleDownloadAction}
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>{t('poster.downloadBtn')}</span>
            </SubmitButton>

            <AnimatePresence>
              {pdfStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center py-4 px-6 rounded-2xl text-base font-bold shadow-sm font-sans ${
                    pdfStatus === 'error' ? 'bg-red-50 text-red-600' : 
                    pdfStatus === 'done' ? 'bg-green-50 text-green-600' : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  {pdfMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Preview Column */}
          <motion.div 
            className="hidden lg:flex flex-col w-full lg:w-1/2 lg:sticky lg:top-24 lg:self-start pb-12"
            variants={itemVariants}
          >
            <div 
              id="poster-preview"
              ref={previewRef} 
              className="w-full bg-white overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="bg-red-700 py-6 text-center">
                <h2 className={`text-4xl font-black text-white font-sans ${isRTL ? 'tracking-normal' : 'tracking-widest uppercase'}`}>
                  {t('poster.previewMissing')}
                </h2>
                <p className={`text-red-100 text-[0.65rem] font-bold mt-2 font-sans ${isRTL ? 'tracking-normal' : 'tracking-[0.2em] uppercase'}`}>
                  {t('poster.previewHelp')}
                </p>
              </div>

              {/* Image Section */}
              <div className="relative w-full bg-slate-200 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {previewImage ? (
                    <motion.img 
                      key={previewImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-auto object-contain block" 
                    />
                  ) : (
                    <motion.div 
                      key="no-image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-300 flex flex-col items-center gap-2 min-h-64 justify-center"
                    >
                      <FontAwesomeIcon icon={faImage} className="text-8xl opacity-20" />
                      <span className="text-sm font-bold opacity-30 uppercase tracking-[0.2em] font-sans">{t('poster.noPhoto')}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8 pt-20">
                  <h3 className="text-4xl font-black text-white drop-shadow-xl font-sans leading-tight" style={isRTL ? { letterSpacing: '0' } : {}}>
                    {fullName || t('poster.notProvided')}
                  </h3>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-8 bg-white flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-8 font-sans">
                  <div className="flex flex-col">
                    <span className={`text-[0.65rem] font-bold text-slate-400 mb-1.5 ${isRTL ? 'tracking-none normal-case' : 'uppercase tracking-[0.2em]'}`}>{t('poster.age')}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none" style={isRTL ? { letterSpacing: '0' } : {}}>
                      {age && ageUnit ? `${age} ${ageUnit === 'years' ? (language === 'ar' ? 'سنوات' : 'Years') : ageUnit === 'months' ? (language === 'ar' ? 'شهر' : 'Months') : (language === 'ar' ? 'يوم' : 'Days')}` : t('poster.notProvided')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[0.65rem] font-bold text-slate-400 mb-1.5 ${isRTL ? 'tracking-none normal-case' : 'uppercase tracking-[0.2em]'}`}>{t('poster.height')}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none" style={isRTL ? { letterSpacing: '0' } : {}}>
                      {height ? `${height} ${t('poster.heightUnit')}` : t('poster.notProvided')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-6">
                  <span className={`text-[0.65rem] font-bold text-slate-400 mb-2 font-sans ${isRTL ? 'tracking-none normal-case' : 'uppercase tracking-[0.2em]'}`}>
                    {t('poster.lastSeen')}
                  </span>
                  <span className="text-lg font-bold text-slate-800 line-clamp-1 font-sans" style={isRTL ? { letterSpacing: '0' } : {}}>
                    {lastSeen || t('poster.notProvided')}
                  </span>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-6">
                  <span className={`text-[0.65rem] font-bold text-slate-400 mb-2 font-sans ${isRTL ? 'tracking-none normal-case' : 'uppercase tracking-[0.2em]'}`}>
                    {t('poster.descClothing')}
                  </span>
                  <p className="text-base font-medium text-slate-600 leading-relaxed line-clamp-3 font-sans" style={isRTL ? { letterSpacing: '0' } : {}}>
                    {clothing || t('poster.noDesc')}
                  </p>
                </div>

                <div className="mt-2 bg-red-50 border border-red-100 p-6 text-center shadow-sm">
                  <div className="bg-red-700 text-white px-2 sm:px-6 py-4 font-black text-base sm:text-xl shadow-lg flex items-center justify-center gap-2 sm:gap-3 leading-tight">
                    <FontAwesomeIcon icon={faCloudArrowUp} className={`text-base shrink-0 ${isRTL ? '-rotate-90' : 'rotate-90'}`} />
                    <span dir="ltr" className="break-all sm:break-normal">{contact || t('poster.contactAuth')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Poster;

