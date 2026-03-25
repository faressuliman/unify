import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faDownload, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Poster = () => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [clothing, setClothing] = useState('');
  const [contactType, setContactType] = useState<'mobile' | 'email'>('mobile');
  const [contact, setContact] = useState('');
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [pdfMessage, setPdfMessage] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  const previewImage = photoDataUrl || (photo ? URL.createObjectURL(photo) : '');

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
    <section className="min-h-screen bg-slate-50 py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div 
        className="mx-auto w-full max-w-7xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="mb-8 text-start" variants={itemVariants}>
          <p className="text-sm text-slate-500 mb-1">{t('poster.breadcrumb')}</p>
          <h1 className="text-3xl font-bold text-slate-800">{t('poster.title')}</h1>
          <p className="text-base text-slate-500 max-w-2xl mt-1 leading-relaxed">{t('poster.subtitle')}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Personal Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">👤</span>
                {t('poster.personalDetails')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600">{t('poster.fullName')}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('poster.fullNamePlaceholder')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all font-sans"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 font-sans">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">{t('poster.age')}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '' || Number(val) <= 100) {
                          setAge(val);
                        }
                      }}
                      placeholder={t('poster.agePlaceholder')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-600">{t('poster.height')}</label>
                    <div className="relative">
                      <input
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
                        className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-base text-slate-700 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all ${isRTL ? 'pr-4 pl-14' : 'pl-4 pr-14'}`}
                      />
                      <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 ${isRTL ? 'left-4' : 'right-4'}`}>{t('poster.heightUnit')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600">{t('poster.lastSeen')}</label>
                  <input
                    type="text"
                    value={lastSeen}
                    onChange={(e) => setLastSeen(e.target.value)}
                    placeholder={t('poster.lastSeenPlaceholder')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">📷</span>
                {t('poster.uploadPhoto')}
              </h2>

              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <AnimatePresence mode="wait">
                  {photoDataUrl ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="mx-auto h-40 w-40 overflow-hidden rounded-2xl border-4 border-white shadow-xl">
                        <img src={photoDataUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 font-sans">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 active:scale-95">
                          <FontAwesomeIcon icon={faImage} className="text-slate-400" />
                          <span>{t('poster.changePhoto')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => setPhotoDataUrl(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(null);
                            setPhotoDataUrl('');
                          }}
                          className="inline-flex items-center gap-2 hover:cursor-pointer rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span>{t('poster.remove')}</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="mb-4 flex items-center justify-center text-4xl text-slate-300">
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-secondary" />
                      </div>
                      <p className="mb-1 text-base font-bold text-slate-700 font-sans">{t('poster.dragDrop')}</p>
                      <p className="mb-6 text-xs text-slate-400 font-sans">{t('poster.uploadHint')}</p>

                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-secondary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:bg-secondary/90 hover:scale-[1.02] active:scale-95">
                        <span>{t('poster.browseFiles')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => setPhotoDataUrl(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">📝</span>
                {t('poster.additionalInfo')}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600 font-sans">{t('poster.clothingDesc')}</label>
                  <textarea
                    value={clothing}
                    onChange={(e) => setClothing(e.target.value)}
                    placeholder={t('poster.clothingPlaceholder')}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="mb-4 block text-sm font-bold text-slate-600 font-sans">{t('poster.contactTips')}</label>
                  <div className="mb-4 flex gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => { setContactType('mobile'); setContact(''); }}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${contactType === 'mobile' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer'}`}
                    >
                      {t('poster.mobile')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setContactType('email'); setContact(''); }}
                      className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${contactType === 'email' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer'}`}
                    >
                      {t('poster.email')}
                    </button>
                  </div>
                  <input
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-center text-slate-700 outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary text-white shadow-2xl shadow-secondary/20 text-lg font-black transition-all hover:bg-secondary/90 disabled:opacity-50 cursor-pointer font-sans"
              disabled={pdfStatus === 'processing'}
              onClick={async () => {
                const errors: string[] = [];
                if (!photoDataUrl) errors.push(t('poster.photoReq'));
                if (!fullName.trim()) errors.push(t('poster.nameReq'));
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
                  const imgData = await toJpeg(previewRef.current, { quality:1.0, pixelRatio:3 });
                  const pdf = new jsPDF({ orientation:'p', unit:'mm', format:'a4' });
                  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
                  pdf.save(`Missing_Person_${fullName.replace(/\s+/g, '_')}.pdf`);
                  setPdfStatus('done');
                  setPdfMessage(t('poster.downloadStarted'));
                  setTimeout(() => setPdfStatus('idle'), 3000);
                } catch (e) {
                  setPdfStatus('error');
                  setPdfMessage(t('poster.errorOccurred'));
                  setTimeout(() => setPdfStatus('idle'), 3000);
                }
              }}
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>{t('poster.downloadBtn')}</span>
            </motion.button>

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
            className="flex bg-slate-100 rounded-[2.5rem] border border-slate-200 shadow-inner   h-fit lg:sticky lg:top-24"
            variants={itemVariants}
          >
            <div 
              ref={previewRef} 
              className="w-full  mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="bg-red-700 py-6 text-center">
                <h2 className="text-4xl font-black text-white tracking-[0.1em] uppercase font-sans">
                  {t('poster.previewMissing')}
                </h2>
                <p className="text-red-100 text-[0.65rem] font-bold tracking-[0.2em] mt-2 uppercase font-sans">
                  {t('poster.previewHelp')}
                </p>
              </div>

              {/* Image Section */}
              <div className="relative w-full aspect-square bg-slate-200 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {previewImage ? (
                    <motion.img 
                      key={previewImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={previewImage} 
                      alt="Preview" 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <motion.div 
                      key="no-image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-300 flex flex-col items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faImage} className="text-8xl opacity-20" />
                      <span className="text-sm font-bold opacity-30 uppercase tracking-[0.2em] font-sans">{t('poster.noPhoto')}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8 pt-20">
                  <h3 className="text-4xl font-black text-white drop-shadow-xl font-sans leading-tight">
                    {fullName || t('poster.unknown')}
                  </h3>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-8 bg-white flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-8 font-sans">
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">{t('poster.age')}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {age ? `${age} ${t('poster.years')}` : t('poster.unknown')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">{t('poster.height')}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {height ? `${height} ${t('poster.heightUnit')}` : t('poster.unknown')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-6">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 font-sans">
                    {t('poster.lastSeen')}
                  </span>
                  <span className="text-lg font-bold text-slate-800 line-clamp-1 font-sans">
                    {lastSeen || t('poster.unknown')}
                  </span>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-6">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 font-sans">
                    {t('poster.descClothing')}
                  </span>
                  <p className="text-base font-medium text-slate-600 leading-relaxed line-clamp-3 font-sans">
                    {clothing || t('poster.noDesc')}
                  </p>
                </div>

                <div className="mt-2 bg-red-50 border border-red-100 rounded-[1.25rem] p-6 text-center shadow-sm">
                  <div className="bg-red-700 text-white px-6 py-4 rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faCloudArrowUp} className={`text-base ${isRTL ? '-rotate-90' : 'rotate-90'}`} />
                    <span dir="ltr">{contact || t('poster.contactAuth')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Poster;

