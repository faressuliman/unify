import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';

interface ImageUploadProps {
  label?: string;
  onImageChange: (file: File | null) => void;
  title?: string;
    dragDropText?: string;
  subtitle?: string;
  buttonText?: string;
    changeText?: string;
    removeText?: string;
  initialImage?: string | null;
}

export default function ImageUpload({ 
    label, 
    onImageChange, 
    title = 'Click to Upload ID', 
        dragDropText = 'or drag and drop',
    subtitle = 'JPG, PNG up to 10MB. High resolution preferred.',
    buttonText = 'Browse Files',
        changeText = 'Change Photo',
        removeText = 'Remove',
    initialImage = null
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => setPreview(initialImage ?? null), 0);
    }, [initialImage]);

  const handleFile = (file: File) => {
      if (file) {
          onImageChange(file);
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleFile(e.target.files[0]);
      }
  };

  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreview(null);
      onImageChange(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full">
        {label && <label className="text-base font-bold text-black block mb-3 text-start">{label}</label>}
        
        <div 
            onClick={!preview ? triggerUpload : undefined}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center transition-colors font-sans ${!preview ? 'cursor-pointer hover:bg-slate-50 relative' : ''}`}
        >
        <AnimatePresence mode="wait">
            {preview ? (
            <motion.div 
                key="preview" 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 relative w-full"
            >
                <div className="mx-auto h-40 w-40 overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-slate-100">
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 active:scale-95"
                    >
                        <FontAwesomeIcon icon={faImage} className="text-slate-400" />
                        <span>{changeText}</span>
                    </button>
                    <button 
                        type="button" 
                        onClick={handleRemove}
                        className="inline-flex items-center gap-2 hover:cursor-pointer rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>{removeText}</span>
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleChange} accept="image/*" className="hidden" />
            </motion.div>
            ) : (
            <motion.div 
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center pointer-events-none"
            >
                <div className="mb-4 flex items-center justify-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#faeed1] shadow-sm">
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-2xl text-black" />
                    </span>
                </div>
                <p className="mb-2 text-[#2d3748] font-sans">
                                    <span className="font-bold">{title}</span>{' '}
                                    {dragDropText && <span className="font-medium">{dragDropText}</span>}
                </p>
                <p className="mb-6 text-sm text-[#94a3b8] font-sans font-medium">{subtitle}</p>

                <button 
                  type="button"
                  className="pointer-events-auto inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#faeed1] px-8 py-3 text-sm font-bold text-black shadow-sm transition-all hover:bg-[#f3e5c3] active:scale-95"
                >
                  {buttonText}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleChange} accept="image/*" className="hidden pointer-events-auto" />
            </motion.div>
            )}
        </AnimatePresence>
        </div>
    </div>
  );
}
