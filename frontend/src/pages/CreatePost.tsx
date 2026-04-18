import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Camera, FileText, MapPin, Send } from 'lucide-react';
import FormInput from '@/components/ui/FormInput';
import FormTextArea from '@/components/ui/FormTextArea';
import SubmitButton from '@/components/ui/SubmitButton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SelectMenu from '@/components/ui/SelectMenu';
import SegmentedControl from '@/components/ui/SegmentedControl';
import LocalizedDateInput from '@/components/ui/LocalizedDateInput';
import ImageUpload from '@/components/ui/ImageUpload';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import PrivacyBadge from '@/components/ui/PrivacyBadge';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../data/cities';
import { getEyeColorOptions, getHairColorOptions } from '../data/appearanceOptions';
import { ApiError, postApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CreatePost = () => {
    const { token } = useAuth();
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const navigate = useNavigate();

    const t = language === 'ar' ? ar.createPost : en.createPost;

    const postTypeOptions = [
        { label: t.missingPerson, value: 'missing' },
        { label: t.foundPerson, value: 'found' }
    ];

    const genderOptions = [
        { label: t.selectGender, value: '' },
        { label: t.male, value: 'male' },
        { label: t.female, value: 'female' }
    ];

    const colorOptions = [
        { label: t.selectColor, value: '' },
        ...getHairColorOptions(language)
    ];

    const eyeOptions = [
        { label: t.selectColor, value: '' },
        ...getEyeColorOptions(language)
    ];

    const cityOptions = [
        { label: t.selectCity, value: '' },
        ...(isRTL ? EGYPTIAN_CITIES_AR : EGYPTIAN_CITIES).map((city) => ({ value: city, label: city }))
    ];

    const affiliationOptions = [
        { label: t.affiliationPlaceholder, value: '' },
        { label: t.affiliationNone, value: 'none' },
        { label: t.affiliationShelter, value: 'shelter' },
        { label: t.affiliationHospital, value: 'hospital' },
        { label: t.affiliationNonProfit, value: 'nonprofit' },
        { label: t.affiliationGovernment, value: 'government' }
    ];

    const ageUnitOptions = [
        { label: language === 'ar' ? 'اختر وحدة العمر' : 'Select Age Unit', value: '' },
        { label: language === 'ar' ? 'سنوات' : 'Years', value: 'years' },
        { label: language === 'ar' ? 'أشهر' : 'Months', value: 'months' },
        { label: language === 'ar' ? 'أيام' : 'Days', value: 'days' }
    ];

    const [formData, setFormData] = useState({
        postType: 'missing',
        firstName: '',
        lastName: '',
        age: '',
        ageUnit: '',
        gender: '',
        hairColor: '',
        eyeColor: '',
        clothingDescription: '',
        city: '',
        foundLocation: '',
        affiliation: '',
        organizationName: '',
        reporterPhone: '',
        lastSeenLocation: '',
        lastSeenDate: '',
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitError('');

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => {
            if (name === 'affiliation' && (value === '' || value === 'none')) {
                return { ...prev, affiliation: value, organizationName: '' };
            }
            if (name === 'ageUnit') {
                return { ...prev, [name]: value, age: '' };
            }

            return { ...prev, [name]: value };
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        setSubmitError('');

        if (name === 'affiliation' && errors.organizationName) {
            setErrors(prev => ({ ...prev, organizationName: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        
        if (!formData.firstName.trim()) newErrors.firstName = t.requiredField;
        if (!formData.lastName.trim()) newErrors.lastName = t.requiredField;
        
        if (!formData.ageUnit) {
            newErrors.ageUnit = t.requiredField;
        } else if (!formData.age.trim()) {
            newErrors.age = t.requiredField;
        } else {
            const ageNum = Number(formData.age);
            if (formData.ageUnit === 'years' && (ageNum < 1 || ageNum > 90)) {
                newErrors.age = t.ageRangeError;
            } else if (formData.ageUnit === 'months' && (ageNum < 1 || ageNum > 11)) {
                newErrors.age = language === 'ar' ? 'الأشهر يجب أن تكون بين 1 و 11' : 'Months must be between 1 and 11';
            } else if (formData.ageUnit === 'days' && (ageNum < 1 || ageNum > 30)) {
                newErrors.age = language === 'ar' ? 'الأيام يجب أن تكون بين 1 و 30' : 'Days must be between 1 and 30';
            }
        }
        
        if (!formData.gender) newErrors.gender = t.requiredField;
        if (!formData.hairColor) newErrors.hairColor = t.requiredField;
        if (!formData.eyeColor) newErrors.eyeColor = t.requiredField;
        
        const descriptionText = formData.clothingDescription.trim();
        if (!formData.clothingDescription.trim()) {
            newErrors.clothingDescription = t.requiredField;
        } else if (descriptionText.length < 10) {
            newErrors.clothingDescription = t.minWordsError;
        }
        
        if (!formData.city) newErrors.city = t.requiredField;

        if (formData.postType === 'missing') {
            if (!formData.lastSeenLocation.trim()) newErrors.lastSeenLocation = t.requiredField;
            if (!formData.lastSeenDate) newErrors.lastSeenDate = t.requiredField;
        } else {
            if (!formData.foundLocation.trim()) newErrors.foundLocation = t.requiredField;
            if (formData.affiliation && formData.affiliation !== 'none' && !formData.organizationName.trim()) {
                newErrors.organizationName = t.requiredField;
            }
            if (formData.reporterPhone.trim() && !/^\d{11}$/.test(formData.reporterPhone.trim())) {
                newErrors.reporterPhone = t.phoneDigitsError;
            }
        }

        if (!photo) newErrors.photo = t.requiredField;
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!token) {
            setSubmitError(isRTL ? 'يجب تسجيل الدخول أولاً لإنشاء بلاغ.' : 'You need to log in first to create a post.');
            return;
        }

        setSubmitError('');
        setIsSubmitting(true);

        try {
            await postApi.createPost(
                {
                    postType: formData.postType as 'missing' | 'found',
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    age: Number(formData.age),
                    ageUnit: formData.ageUnit as 'years' | 'months' | 'days',
                    gender: formData.gender as 'male' | 'female' | 'unknown',
                    hairColour: formData.hairColor,
                    eyeColour: formData.eyeColor,
                    clothesDescription: formData.clothingDescription.trim(),
                    city: formData.city,
                    lastSeenLocation: formData.postType === 'missing' ? formData.lastSeenLocation.trim() : undefined,
                    lastSeenDate: formData.postType === 'missing' ? formData.lastSeenDate : undefined,
                    foundLocation: formData.postType === 'found' ? formData.foundLocation.trim() : undefined,
                    affiliation: formData.postType === 'found' && formData.affiliation ? formData.affiliation : undefined,
                    organizationName:
                        formData.postType === 'found' && formData.affiliation && formData.affiliation !== 'none'
                            ? formData.organizationName.trim()
                            : undefined,
                    reporterPhone: formData.postType === 'found' && formData.reporterPhone.trim()
                        ? formData.reporterPhone.trim()
                        : undefined,
                    photos: photo ? [photo] : [],
                },
                token
            );

            navigate('/search');
        } catch (error) {
            setSubmitError(error instanceof ApiError ? error.message : (isRTL ? 'فشل إرسال البلاغ.' : 'Failed to submit post.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className="bg-slate-50 py-8 min-h-screen font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                
                {/* Page Header styled like PosterBuilder */}
                <motion.div variants={itemVariants}>
                    <PageHeader
                        navigatedTo={t.heroTitle}
                        title={t.heroTitle}
                        subtitle={t.heroSubtitle}
                        showArrow={true}
                    />
                </motion.div>

                <div className="max-w-400 mx-auto px-6 lg:px-12 w-full">
                    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2 lg:items-start mt-6">
                        
                        {/* LEFT COLUMN: Input Forms */}
                        <motion.div className="space-y-6 min-w-0" variants={itemVariants}>
                            
                            {/* Basic Information Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans text-start">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                        <UserCircle className="w-5 h-5" />
                                    </span>
                                    {t.personalDetails}
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex flex-col mb-4">
                                        <label className="block text-sm font-bold text-slate-800 mb-3 text-start">{t.postType}</label>
                                        <SegmentedControl
                                            options={postTypeOptions}
                                            value={formData.postType}
                                            onChange={(val) => handleSelectChange('postType', val)}
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 font-sans">
                                        <div>
                                            <FormInput 
                                                label={t.firstName}
                                                type="text" 
                                                name="firstName"
                                                placeholder={t.firstNamePlaceholder} 
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                isRTL={isRTL}
                                                className={errors.firstName ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : 'font-sans'}
                                            />
                                            <ErrorMessage msg={errors.firstName} className="text-[12px] mt-1 text-red-500" />
                                        </div>
                                        <div>
                                            <FormInput 
                                                label={t.lastName}
                                                type="text" 
                                                name="lastName"
                                                placeholder={t.lastNamePlaceholder} 
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                isRTL={isRTL}
                                                className={errors.lastName ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : 'font-sans'}
                                            />
                                            <ErrorMessage msg={errors.lastName} className="text-[12px] mt-1 text-red-500" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 font-sans items-start">
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <SelectMenu 
                                                    id="ageUnit"
                                                    label={language === 'ar' ? 'اختر وحدة العمر' : 'Select Age Unit'}
                                                    value={formData.ageUnit}
                                                    options={ageUnitOptions}
                                                    onChange={(val) => handleSelectChange('ageUnit', val)}
                                                    isRTL={isRTL}
                                                />
                                                <ErrorMessage msg={errors.ageUnit} className="text-[12px] mt-1 text-red-500" />
                                            </div>
                                            
                                            {formData.ageUnit && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                    <FormInput 
                                                        label={
                                                            formData.ageUnit === 'years' ? (language === 'ar' ? 'العمر (بالسنوات)' : 'Age (Years)') : 
                                                            formData.ageUnit === 'months' ? (language === 'ar' ? 'العمر (بالأشهر)' : 'Age (Months)') : 
                                                            (language === 'ar' ? 'العمر (بالأيام)' : 'Age (Days)')
                                                        }
                                                        type="text" 
                                                        name="age"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        placeholder={t.agePlaceholder} 
                                                        value={formData.age}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            if (val !== '') {
                                                                const num = Number(val);
                                                                if (formData.ageUnit === 'years' && num > 90) return;
                                                                if (formData.ageUnit === 'months' && num > 11) return;
                                                                if (formData.ageUnit === 'days' && num > 30) return;
                                                            }
                                                            handleSelectChange('age', val);
                                                        }}
                                                        isRTL={isRTL}
                                                        className={errors.age ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : 'font-sans'}
                                                    />
                                                    <ErrorMessage msg={errors.age} className="text-[12px] mt-1 text-red-500" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div>
                                            <SelectMenu 
                                                id="gender"
                                                label={t.gender}
                                                value={formData.gender}
                                                options={genderOptions}
                                                onChange={(val) => handleSelectChange('gender', val)}
                                                isRTL={isRTL}
                                            />
                                            <ErrorMessage msg={errors.gender} className="text-[12px] mt-1 text-red-500" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <SelectMenu 
                                            id="city"
                                            label={t.city}
                                            value={formData.city}
                                            options={cityOptions}
                                            onChange={(val) => handleSelectChange('city', val)}
                                            isRTL={isRTL}
                                        />
                                        <ErrorMessage msg={errors.city} className="text-[12px] mt-1 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Appearance & Details Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans text-start">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                        <FileText className="w-5 h-5" />
                                    </span>
                                    {t.appearanceDetails}
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2 font-sans">
                                        <div>
                                            <SelectMenu 
                                                id="hairColor"
                                                label={t.hairColor}
                                                value={formData.hairColor}
                                                options={colorOptions}
                                                onChange={(val) => handleSelectChange('hairColor', val)}
                                                isRTL={isRTL}
                                            />
                                            <ErrorMessage msg={errors.hairColor} className="text-[12px] mt-1 text-red-500" />
                                        </div>
                                        <div>
                                            <SelectMenu 
                                                id="eyeColor"
                                                label={t.eyeColor}
                                                value={formData.eyeColor}
                                                options={eyeOptions}
                                                onChange={(val) => handleSelectChange('eyeColor', val)}
                                                isRTL={isRTL}
                                            />
                                            <ErrorMessage msg={errors.eyeColor} className="text-[12px] mt-1 text-red-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <FormTextArea
                                            id="clothingDescription"
                                            name="clothingDescription"
                                            label={t.clothing}
                                            placeholder={t.clothingPlaceholder}
                                            value={formData.clothingDescription}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`resize-none font-sans ${errors.clothingDescription ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : ''}`}
                                        />
                                        <ErrorMessage msg={errors.clothingDescription} className="text-[12px] mt-1 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Last Seen Information Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans text-start">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                        <MapPin className="w-5 h-5" />
                                    </span>
                                    {formData.postType === 'missing' ? t.lastSeenDetails : t.foundDetails}
                                </h2>

                                <div className="space-y-4 font-sans">
                                    {formData.postType === 'missing' ? (
                                        <>
                                            <div>
                                                <FormInput 
                                                    label={t.lastSeenLocation}
                                                    type="text" 
                                                    name="lastSeenLocation"
                                                    placeholder={t.lastSeenLocationPlaceholder} 
                                                    value={formData.lastSeenLocation}
                                                    onChange={handleChange}
                                                    isRTL={isRTL}
                                                    className={errors.lastSeenLocation ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : ''}
                                                />
                                                <ErrorMessage msg={errors.lastSeenLocation} className="text-[12px] mt-1 text-red-500" />
                                            </div>

                                            <div>
                                                <LocalizedDateInput
                                                    id="lastSeenDate"
                                                    label={t.lastSeenDate}
                                                    value={formData.lastSeenDate}
                                                    onChange={(val) => handleSelectChange('lastSeenDate', val)}
                                                    placeholder={t.lastSeenDatePlaceholder}
                                                    isRTL={isRTL}
                                                />
                                                <ErrorMessage msg={errors.lastSeenDate} className="text-[12px] mt-1 text-red-500" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <FormInput 
                                                    label={t.foundLocation}
                                                    type="text" 
                                                    name="foundLocation"
                                                    placeholder={t.foundLocationPlaceholder} 
                                                    value={formData.foundLocation}
                                                    onChange={handleChange}
                                                    isRTL={isRTL}
                                                    className={errors.foundLocation ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : ''}
                                                />
                                                <ErrorMessage msg={errors.foundLocation} className="text-[12px] mt-1 text-red-500" />
                                            </div>

                                            <div className="rounded-xl border border-slate-200 p-4 min-w-0">
                                                <SelectMenu
                                                    id="affiliation"
                                                    label={<span className="block whitespace-normal wrap-break-word leading-snug">{t.affiliatedQuestion} <span className="text-slate-500">{t.optional}</span></span>}
                                                    value={formData.affiliation}
                                                    options={affiliationOptions}
                                                    onChange={(val) => handleSelectChange('affiliation', val)}
                                                    isRTL={isRTL}
                                                />

                                                {formData.affiliation && formData.affiliation !== 'none' && (
                                                    <div className="mt-4">
                                                        <FormInput
                                                            label={t.organizationName}
                                                            type="text"
                                                            name="organizationName"
                                                            placeholder={t.organizationNamePlaceholder}
                                                            value={formData.organizationName}
                                                            onChange={handleChange}
                                                            isRTL={isRTL}
                                                            className={errors.organizationName ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : ''}
                                                        />
                                                        <ErrorMessage msg={errors.organizationName} className="text-[12px] mt-1 text-red-500" />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <FormInput
                                                    label={t.reporterPhone}
                                                    type="tel"
                                                    name="reporterPhone"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    placeholder={t.reporterPhonePlaceholder}
                                                    value={formData.reporterPhone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                        handleSelectChange('reporterPhone', val);
                                                    }}
                                                    isRTL={isRTL}
                                                    className={errors.reporterPhone ? 'border-red-400 focus:ring-1 focus:ring-red-500/20' : ''}
                                                />
                                                <ErrorMessage msg={errors.reporterPhone} className="text-[12px] mt-1 text-red-500" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Photo Upload Card */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 font-sans text-start">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                        <Camera className="w-5 h-5" />
                                    </span>
                                    {t.uploadPhoto}
                                </h2>

                                <ImageUpload 
                                    onImageChange={(file) => {
                                        setPhoto(file);
                                        if (errors.photo) {
                                            setErrors(prev => ({ ...prev, photo: '' }));
                                        }
                                    }}
                                    title={t.uploadPhoto}
                                    dragDropText={t.dragDropText}
                                    subtitle={t.uploadHint} 
                                    buttonText={t.browseFiles} 
                                    changeText={t.changePhoto}
                                    removeText={t.removeText}
                                />
                                <ErrorMessage msg={errors.photo} className="text-[12px] mt-2 text-red-500" />
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-3 w-full">
                                {submitError ? (
                                    <div className="w-full sm:basis-full">
                                        <ErrorMessage msg={submitError} className="text-sm" />
                                    </div>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="order-2 sm:order-1 flex-1 w-full py-3.5 text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer text-sm font-bold rounded-xl transition-all"
                                >
                                    {t.cancel}
                                </button>

                                <SubmitButton
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="order-1 sm:order-2 flex-1 w-full py-3.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>{t.submit}</span>
                                        </>
                                    )}
                                </SubmitButton>
                            </div>
                        </motion.div>

                        {/* RIGHT COLUMN: Illustration & Action Buttons */}
                        <motion.div variants={itemVariants} className="hidden lg:block lg:sticky lg:top-24 space-y-6">
                            
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center overflow-hidden relative min-h-100 lg:min-h-125">
                                
                                {/* Animated UI Composition mimicking the user's illustration */}
                                <div className={`relative w-full max-w-sm aspect-square transition-transform duration-500 ${formData.postType === 'found' ? 'scale-[1.02]' : ''}`}>
                                    
                                    {/* Decorative Blur Orbs */}
                                    <div className="absolute top-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-60"></div>
                                    <div className="absolute bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-60"></div>

                                    {/* Mock Browser/App Window Background */}
                                    <div className="absolute inset-4 mt-8 ms-8 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner flex flex-col overflow-hidden">
                                        <div className="h-8 bg-slate-100/80 border-b border-slate-200 flex items-center px-4 gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                        </div>
                                        <div className="p-4 flex gap-4">
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 w-3/4 bg-slate-200 rounded-md"></div>
                                                <div className="h-3 w-1/2 bg-slate-200 rounded-md"></div>
                                            </div>
                                            <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                                        </div>
                                    </div>

                                    {/* Floating Post Card 1 */}
                                    <motion.div 
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute top-12 -left-2 sm:-left-6 w-60 sm:w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-4 flex items-center gap-3 z-10"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2.5 w-3/4 bg-secondary/40 rounded-full"></div>
                                            <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
                                        </div>
                                    </motion.div>

                                    {/* Floating Post Card 2 */}
                                    <motion.div 
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="absolute top-36 -left-2 sm:-left-6 w-60 sm:w-64 bg-transparent border-[1.5px] border-secondary/30 rounded-xl backdrop-blur-sm p-4 flex items-center gap-3 z-10"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-secondary/5 border border-secondary/20 shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2.5 w-2/3 bg-secondary/30 rounded-full"></div>
                                            <div className="h-2 w-1/3 bg-slate-200/80 rounded-full"></div>
                                        </div>
                                    </motion.div>

                                    {/* Floating Post Card 3 (The main one "being placed") */}
                                    <motion.div 
                                        animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                        className="absolute bottom-16 -right-2 sm:-right-8 w-60 sm:w-64 bg-secondary text-white rounded-xl shadow-xl shadow-secondary/20 p-4 flex items-center gap-3 z-20"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                            <UserCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-2.5 w-3/4 bg-white/60 rounded-full"></div>
                                            <div className="h-2 w-1/2 bg-white/40 rounded-full"></div>
                                        </div>
                                        {/* Abstract Hand/Figure carrying the card */}
                                        <div className="absolute -bottom-6 -left-4 w-12 h-12 bg-slate-800 rounded-full shadow-lg border-4 border-white hidden sm:block"></div>
                                    </motion.div>

                                </div>

                                <div className="relative z-20 text-center mt-6">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                        {formData.postType === 'missing' ? t.missingPerson : t.foundPerson}
                                    </h3>
                                   <PrivacyBadge 
                                    description={t.photoWarningBadge || t.photoWarning}
                                />
                                </div>
                            </div>
                            
                               
                                
                        </motion.div>

                    </form>
                </div>
            </motion.div>
        </section>
    );
};

export default CreatePost;
