import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FileSearch, ImagePlus, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import FormInput from '../ui/FormInput';
import SelectMenu from '../ui/SelectMenu';
import LocalizedDateInput from '../ui/LocalizedDateInput';
import ErrorMessage from '../ui/ErrorMessage';
import { useLanguage } from '../LanguageContext';
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../../data/cities';

export interface SearchFilters {
  firstName: string;
  lastName: string;
  ageMin: string;
  ageMax: string;
  hairColor: string;
  eyeColor: string;
  gender: string;
  location: string;
  clothing: string;
  dateMissing: string;
  city: string;
}

export const defaultSearchFilters: SearchFilters = {
  firstName: '',
  lastName: '',
  ageMin: '',
  ageMax: '',
  hairColor: '',
  eyeColor: '',
  gender: '',
  location: '',
  clothing: '',
  dateMissing: '',
  city: '',
};

interface SearchFiltersPanelProps {
  onApplyFilters: (values: SearchFilters, shouldScroll?: boolean) => void;
}

export default function SearchFiltersPanel({ onApplyFilters }: SearchFiltersPanelProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState('');
  const searchImageInputRef = useRef<HTMLInputElement>(null);

  const { register, control, handleSubmit, reset, setValue, getValues, watch } = useForm<SearchFilters>({
    defaultValues: defaultSearchFilters,
  });

  const watchedFilters = watch();
  const hasAtLeastOneInput = Object.values(watchedFilters).some((value) => value?.trim() !== '') || Boolean(searchImage);
  const hasActiveFilters = Object.values(watchedFilters).some((value) => value?.trim() !== '');

  const hairColors = useMemo(
    () => [
      { value: 'Black', label: 'Black' },
      { value: 'Brown', label: 'Brown' },
      { value: 'Blonde', label: 'Blonde' },
      { value: 'Red', label: 'Red' },
      { value: 'Gray', label: 'Gray' },
      { value: 'White', label: 'White' },
    ],
    []
  );

  const eyeColors = useMemo(
    () => [
      { value: 'Brown', label: 'Brown' },
      { value: 'Blue', label: 'Blue' },
      { value: 'Green', label: 'Green' },
      { value: 'Hazel', label: 'Hazel' },
      { value: 'Gray', label: 'Gray' },
    ],
    []
  );

  const genderOptions = useMemo(
    () => [
      { value: '', label: t('search.any') || 'Any' },
      { value: 'male', label: t('search.male') || 'Male' },
      { value: 'female', label: t('search.female') || 'Female' },
    ],
    [t]
  );

  const eyeColorOptions = useMemo(() => [{ value: '', label: t('search.any') || 'Any' }, ...eyeColors], [eyeColors, t]);

  const hairColorOptions = useMemo(() => [{ value: '', label: t('search.any') || 'Any' }, ...hairColors], [hairColors, t]);

  const cityOptions = useMemo(
    () => [
      { value: '', label: t('search.any') || 'Any' },
      ...(isRTL ? EGYPTIAN_CITIES_AR : EGYPTIAN_CITIES).map((city) => ({ value: city, label: city })),
    ],
    [isRTL, t]
  );

  useEffect(() => {
    if (hasAtLeastOneInput && submitError) {
      setSubmitError('');
    }
  }, [hasAtLeastOneInput, submitError]);

  const triggerSearchImagePicker = () => {
    searchImageInputRef.current?.click();
  };

  const clearSearchImage = () => {
    setSearchImage(null);
    if (searchImageInputRef.current) {
      searchImageInputRef.current.value = '';
    }
  };

  const clearFieldAndApply = (field: keyof SearchFilters) => {
    const nextValues = { ...getValues(), [field]: '' };
    setValue(field, '', { shouldDirty: true, shouldTouch: true });
    onApplyFilters(nextValues, false);
  };

  const clearAllAndReset = () => {
    reset(defaultSearchFilters);
    onApplyFilters(defaultSearchFilters, false);
    clearSearchImage();
    setSubmitError('');
  };

  const onSubmit = (values: SearchFilters) => {
    const hasAnyFilter = Object.values(values).some((value) => value.trim() !== '');

    if (!hasAnyFilter && !searchImage) {
      setSubmitError(
        t('search.atLeastOneInputError') ||
          (isRTL ? 'يرجى إدخال حقل واحد على الأقل قبل البحث.' : 'Please enter at least one input before searching.')
      );
      return;
    }

    setSubmitError('');
    onApplyFilters(values);
  };

  const renderClearFieldButton = (field: keyof SearchFilters) => {
    if (!watchedFilters[field]) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={() => clearFieldAndApply(field)}
        className="text-xs font-semibold text-secondary hover:text-secondary/80 cursor-pointer"
      >
        {t('search.clearField') || 'Clear'}
      </button>
    );
  };

  const renderFieldLabel = (text: string, field: keyof SearchFilters) => (
    <span className="flex items-center justify-between gap-3">
      <span>{text}</span>
      {renderClearFieldButton(field)}
    </span>
  );

  const labelClass = 'text-sm font-medium leading-none text-tertiary block text-start';
  const inputClass =
    'flex h-10 w-full rounded-md border-0 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50/50 transition duration-300';

  return (
    <div className="rounded-xl border border-primary-200 bg-white shadow-sm mb-12">
      <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100 bg-white rounded-t-xl">
        <h3 className="font-semibold leading-none tracking-tight text-xl text-start text-tertiary flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-secondary" />
          {t('search.searchFormTitle') || 'Search & Filter'}
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-6 space-y-6">
        <div className="space-y-3">
          <label htmlFor="searchImage" className="text-base font-bold text-black block text-start">
            {t('search.uploadImage') || 'Upload Image for AI Recognition'}
          </label>
          <input
            ref={searchImageInputRef}
            id="searchImage"
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchImage(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={triggerSearchImagePicker}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-[#e6dcaf] transition-colors px-4 flex items-center justify-between cursor-pointer group/upload"
            >
              <span className="flex items-center gap-2 font-bold text-[#1c190d] text-sm">
                <ImagePlus className="h-5 w-5 text-slate-400 group-hover/upload:text-secondary transition-all group-hover/upload:scale-105" strokeWidth={2} />
                {t('search.chooseFile') || 'Choose File'}
              </span>
              <span className="text-sm text-slate-600 truncate ms-3">
                {searchImage ? searchImage.name : (t('search.noFileChosen') || 'No file chosen')}
              </span>
            </button>
            {searchImage && (
              <button
                type="button"
                onClick={clearSearchImage}
                className="h-12 w-12 rounded-xl border border-input bg-white hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
                aria-label={isRTL ? 'إلغاء اختيار الصورة' : 'Deselect image'}
                title={isRTL ? 'إلغاء اختيار الصورة' : 'Deselect image'}
              >
                <X className="h-5 w-5 text-slate-600" strokeWidth={2.5} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 text-start block mt-2">
            {t('search.imageSearchDesc') || 'Upload a photo to find potential matches using our facial recognition system.'}
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-500 font-medium">{t('search.orUseFilters') || 'OR USE FILTERS'}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearAllAndReset}
              className={`group relative text-sm font-semibold transition-colors cursor-pointer ${
                hasActiveFilters || searchImage
                  ? 'text-secondary hover:text-secondary/80 after:absolute after:inset-s-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-secondary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasActiveFilters && !searchImage}
            >
              {t('search.clearAll') || 'Clear all'}
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormInput
              id="firstName"
              label={renderFieldLabel(t('search.firstName') || 'First Name', 'firstName')}
              placeholder={t('search.firstNamePlaceholder') || 'Enter first name'}
              className={inputClass}
              labelClassName={labelClass}
              {...register('firstName')}
            />
            <FormInput
              id="lastName"
              label={renderFieldLabel(t('search.lastName') || 'Last Name', 'lastName')}
              placeholder={t('search.lastNamePlaceholder') || 'Enter last name'}
              className={inputClass}
              labelClassName={labelClass}
              {...register('lastName')}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormInput
              id="ageMin"
              type="number"
              label={renderFieldLabel(t('search.ageMin') || 'Minimum Age', 'ageMin')}
              placeholder={t('search.ageMinPlaceholder') || 'Min age'}
              className={inputClass}
              labelClassName={labelClass}
              inputMode="numeric"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              {...register('ageMin')}
            />
            <FormInput
              id="ageMax"
              type="number"
              label={renderFieldLabel(t('search.ageMax') || 'Maximum Age', 'ageMax')}
              placeholder={t('search.ageMaxPlaceholder') || 'Max age'}
              className={inputClass}
              labelClassName={labelClass}
              inputMode="numeric"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              {...register('ageMax')}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <SelectMenu
                  id="gender"
                  label={renderFieldLabel(t('search.gender') || 'Gender', 'gender')}
                  value={field.value}
                  onChange={field.onChange}
                  options={genderOptions}
                  isRTL={isRTL}
                />
              )}
            />
            <Controller
              name="eyeColor"
              control={control}
              render={({ field }) => (
                <SelectMenu
                  id="eyeColor"
                  label={renderFieldLabel(t('search.eyeColor') || 'Eye Color', 'eyeColor')}
                  value={field.value}
                  onChange={field.onChange}
                  options={eyeColorOptions}
                  isRTL={isRTL}
                />
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              name="hairColor"
              control={control}
              render={({ field }) => (
                <SelectMenu
                  id="hairColor"
                  label={renderFieldLabel(t('search.hairColor') || 'Hair Color', 'hairColor')}
                  value={field.value}
                  onChange={field.onChange}
                  options={hairColorOptions}
                  isRTL={isRTL}
                />
              )}
            />
            <Controller
              name="dateMissing"
              control={control}
              render={({ field }) => (
                <LocalizedDateInput
                  id="dateMissing"
                  label={renderFieldLabel(t('search.dateMissing') || 'Date They Went Missing', 'dateMissing')}
                  value={field.value}
                  onChange={field.onChange}
                  isRTL={isRTL}
                  placeholder={t('search.dateInputHint') || (isRTL ? 'انقر لإدخال التاريخ' : 'Click to enter the date')}
                  labelClassName={labelClass}
                />
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <SelectMenu
                  id="city"
                  label={renderFieldLabel(t('search.city') || 'City', 'city')}
                  value={field.value}
                  onChange={field.onChange}
                  options={cityOptions}
                  isRTL={isRTL}
                />
              )}
            />
            <FormInput
              id="location"
              label={renderFieldLabel(t('search.location') || 'Location details', 'location')}
              placeholder={t('search.locationPlaceholder') || 'Enter specific location...'}
              className={inputClass}
              labelClassName={labelClass}
              {...register('location')}
            />
          </div>

          <div className="space-y-2 text-start">
            <label htmlFor="clothing" className={labelClass}>
              {renderFieldLabel(t('search.clothing') || 'Clothing Description', 'clothing')}
            </label>
            <div className="relative">
              <textarea
                id="clothing"
                placeholder={t('search.clothingPlaceholder') || 'Describe what they were wearing...'}
                {...register('clothing')}
                className="peer flex min-h-20 w-full rounded-md border-0 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50/50 resize-y transition duration-300"
              />
              <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-secondary opacity-0 peer-focus:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary text-white shadow-2xl shadow-secondary/20 text-lg font-black transition-all hover:bg-secondary/90 disabled:opacity-50 cursor-pointer font-sans"
        >
          <Search className="h-5 w-5" />
          {t('search.searchButton') || 'Search'}
        </motion.button>
        <ErrorMessage msg={submitError} />

        <div className="p-4 bg-primary/20 border border-primary/40 rounded-lg flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-slate-700 text-start mt-0.5 leading-relaxed">
            <strong>{t('search.tipLabel') || 'Pro Tip:'}</strong>{' '}
            {t('search.tipText') || 'Providing multiple filters helps narrow down the results effectively.'}
          </p>
        </div>
      </form>
    </div>
  );
}
