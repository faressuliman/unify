import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faDownload, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';

const Poster = () => {
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

  return (
    <section className="min-h-screen bg-slate-50 py-8 px-0">
      <div className="mx-auto w-full max-w-390 px-6 lg:px-8">
        <p className="text-sm text-slate-500 mb-6 text-left">Home &gt; Poster Builder</p>
        <h1 className="text-3xl font-bold text-slate-800 mb-5 text-left">Create Missing Person Alert</h1>
        <p className="text-md text-slate-500 mb-6 text-left">Follow the steps below to generate a standardized, high-impact missing person <br/> poster. Your data is encrypted and secure.</p>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600">👤</span>
                Personal Details
              </h2>

              <label className="mb-2 block text-sm font-medium text-slate-600 text-left">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 text-left">Age</label>
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
                    placeholder="Max 100"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600 text-left">Height</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={height}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        if (val === '' || Number(val) <= 200) {
                          setHeight(val);
                        }
                      }}
                      placeholder="Max 200"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-14 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">cm</span>
                  </div>
                </div>
              </div>

              <label className="mt-4 mb-2 block text-sm font-medium text-slate-600 text-left">Last Seen Location</label>
              <input
                type="text"
                value={lastSeen}
                onChange={(e) => setLastSeen(e.target.value)}
                placeholder="e.g., Street address or landmark"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600">📷</span>
                Upload Photo
              </h2>

              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                {photoDataUrl ? (
                  <div className="space-y-4">
                    <div className="mx-auto h-32 w-32 overflow-hidden rounded-lg border-2 border-white shadow-md">
                      <img src={photoDataUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
                        <FontAwesomeIcon icon={faImage} />
                        <span>Browse another image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setPhoto(file);
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setPhotoDataUrl(reader.result as string);
                              };
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
                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Remove image</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-center text-3xl text-slate-500">
                      <FontAwesomeIcon icon={faCloudArrowUp} />
                    </div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">Drag and drop recent photo</p>
                    <p className="mb-4 text-xs text-slate-500">JPG, PNG up to 10MB. High resolution preferred.</p>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
                      <span>Browse Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setPhoto(file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setPhotoDataUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setPhotoDataUrl('');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600">📝</span>
                Additional Info
              </h2>

              <label className="mb-2 block text-sm font-medium text-slate-600 text-left">Clothing Description</label>
              <textarea
                value={clothing}
                onChange={(e) => setClothing(e.target.value)}
                placeholder="Tattoos, scars, glasses, clothing worn when last seen..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

              <label className="mt-4 mb-2 block text-sm font-medium text-slate-600 text-left">Contact for Tips</label>
              <div className="mb-3 flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setContactType('mobile');
                    setContact('');
                  }}
                  className={`rounded-lg px-3 py-1.5 ${contactType === 'mobile' ? 'bg-primary-600 text-primary-foreground shadow-lg shadow-primary/30 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`}>
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContactType('email');
                    setContact('');
                  }}
                  className={`rounded-lg px-3 py-1.5 ${contactType === 'email' ? 'bg-primary-600 text-primary-foreground shadow-lg shadow-primary/30 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`}>
                  Email
                </button>
              </div>
              <input
                type={contactType === 'email' ? 'email' : 'tel'}
                inputMode={contactType === 'mobile' ? 'tel' : 'email'}
                value={contact}
                onChange={(e) => {
                  if (contactType === 'mobile') {
                    setContact(e.target.value.replace(/[^\d+]/g, ''));
                  } else {
                    setContact(e.target.value);
                  }
                }}
                placeholder={contactType === 'email' ? 'Police department or emergency phone number' : '+201234567890'}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-primary-foreground shadow-lg shadow-primary/30 text-sm font-semibold text-white transition hover:bg-primary-700 cursor-pointer"
              onClick={async () => {
  const errors: string[] = [];

  if (!photoDataUrl) errors.push('Photo is required');
  if (!fullName.trim()) errors.push('Full name is required');
  if (!age || isNaN(Number(age))) errors.push('Valid age is required');
  if (!height || isNaN(Number(height))) errors.push('Valid height is required');
  if (!lastSeen.trim()) errors.push('Last seen location is required');
  if (!clothing.trim()) errors.push('Clothing description is required');

  if (contactType === 'email') {
    if (!contact.trim()) errors.push('Email is required');
    else if (!contact.includes('@') || !contact.includes('.')) {
      errors.push('Valid email format required');
    }
  } else {
    if (!contact.trim()) errors.push('Mobile number is required');
  }

  if (errors.length > 0) {
    setPdfStatus('error');
    setPdfMessage(errors[0]);
    setTimeout(() => setPdfStatus('idle'), 3000);
    return;
  }

  try {
    setPdfStatus('processing');
    setPdfMessage('Generating PDF...');

    if (!previewRef.current) {
      throw new Error("Preview element not found");
    }

    // A small delay ensures any image loading or state changes (like showing processing) render first
    await new Promise(resolve => setTimeout(resolve, 300));

    // Capture the exact DOM node content using optimal settings for high-resolution matching
    const imgData = await toJpeg(previewRef.current, {
      quality: 1.0,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });

    // Auto-calculating properly for printing exactly to A4
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const margin = 0; // Removing margin to allow border-to-border printing if container maxes out
    const maxImgWidth = pdfWidth - (margin * 2);
    const maxImgHeight = pdfHeight - (margin * 2);

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    
    let printWidth = maxImgWidth;
    let printHeight = maxImgWidth / imgRatio;

    if (printHeight > maxImgHeight) {
      printHeight = maxImgHeight;
      printWidth = maxImgHeight * imgRatio;
    }

    const x = (pdfWidth - printWidth) / 2;
    const y = margin; // Started from top

    pdf.addImage(imgData, 'JPEG', x, y, printWidth, printHeight);

    pdf.save(`missing-poster-${fullName.replace(/\s+/g, '-').toLowerCase() || 'report'}.pdf`);
    setPdfStatus('done');
    setPdfMessage('Generate done, downloading...');
    setTimeout(() => setPdfStatus('idle'), 3000);
  } catch (error: any) {
    console.error('PDF generation error', error);
    setPdfStatus('error');
    setPdfMessage(`Unable to generate PDF: ${error.message || 'Error occurred'}. Check console.`);
  }
}}            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Generate PDF</span>
            </button>
            {pdfStatus !== 'idle' && (
              <div className={`mt-3 rounded-lg p-3 text-sm font-semibold ${pdfStatus === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-900'}`}>
                <div className="flex items-center gap-2">
                  {pdfStatus === 'processing' && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  <span>{pdfStatus === 'processing' ? 'Generating... Download will start soon.' : pdfMessage}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex  bg-slate-100 rounded-3xl border border-slate-200 shadow-inner h-full">
            <div ref={previewRef} className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-full">
              {/* Header */}
              <div className="bg-red-700 py-4 text-center">
                <h2 className="text-4xl font-black text-white tracking-[0.2em] uppercase">Missing</h2>
                <p className="text-red-100 text-sm font-semibold tracking-widest mt-1 uppercase">Please help us find them</p>
              </div>

              {/* Image Section */}
              <div className="relative w-full h-[450px] bg-slate-200 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-2">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg font-medium">No Photo Provided</span>
                  </div>
                )}
                
                {/* Overlay & Name */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-4xl font-bold text-white drop-shadow-md leading-tight">
                    {fullName || 'Name Unknown'}
                  </h3>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6 bg-white flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</span>
                    <span className="text-lg font-semibold text-slate-800">{age ? `${age} years` : 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Height</span>
                    <span className="text-lg font-semibold text-slate-800">{height ? `${height} cm` : 'Unknown'}</span>
                  </div>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Last Seen
                  </span>
                  <span className="text-base font-medium text-slate-800 leading-snug">{lastSeen || 'Location not provided'}</span>
                </div>

                <div className="flex flex-col border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Description & Clothing
                  </span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {clothing || 'No description provided.'}
                  </p>
                </div>

                {/* Contact CTA */}
                <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-5 text-center shadow-inner">
                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Have you seen this child?</h4>
                  <p className="text-slate-600 text-sm mb-3">Any information can help bring them home safely.</p>
                  <div className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-5 py-3 rounded-lg font-bold w-full text-lg shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {contact || 'Contact Authorities'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
      
    
  );
};

export default Poster;
