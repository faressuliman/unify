import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FileSearch, Search } from 'lucide-react';
import FormInput from '../ui/FormInput';
import FormTextArea from '../ui/FormTextArea';
import SelectMenu from '../ui/SelectMenu';
import LocalizedDateInput from '../ui/LocalizedDateInput';
import ErrorMessage from '../ui/ErrorMessage';
import SubmitButton from '../ui/SubmitButton';
import ImageUpload from '../ui/ImageUpload';
import { useLanguage } from '../../context/LanguageContext';
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../../data/cities';
import { getEyeColorOptions, getHairColorOptions } from '../../data/appearanceOptions';

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

const defaultSearchFilters: SearchFilters = {
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
  onApplyFilters: (
    values: SearchFilters,
    options?: { shouldScroll?: boolean; imageFile?: File | null }
  ) => void;
  initialFilters?: Partial<SearchFilters>;
  initialImageFile?: File | null;
  initialImagePreview?: string | null;
}

export default function SearchFiltersPanel({
  onApplyFilters,
  initialFilters,
  initialImageFile = null,
  initialImagePreview = null,
}: SearchFiltersPanelProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [searchImage, setSearchImage] = useState<File | null>(initialImageFile);
  const [submitError, setSubmitError] = useState('');

  const { register, control, handleSubmit, reset, setValue, getValues, watch } = useForm<SearchFilters>({
    defaultValues: defaultSearchFilters,
  });

  useEffect(() => {
    if (!initialFilters && !initialImageFile) return;
    reset({ ...defaultSearchFilters, ...initialFilters });
    setSearchImage(initialImageFile ?? null);
  }, [initialFilters, initialImageFile, reset]);

  const watchedFilters = getValues(); // or use formState if necessary; watch() causes full component re-renders
  // Note: If we really want full re-renders for disabled state, we can use useWatch from react-hook-form 
  // Let's use react-hook-form correctly:
  const hasAtLeastOneInput = Object.values(watch()).some((value) => value?.trim() !== '') || Boolean(searchImage);
  const hasActiveFilters = Object.values(watch()).some((value) => value?.trim() !== '');

  const hairColors = useMemo(() => getHairColorOptions(language), [language]);

  const eyeColors = useMemo(() => getEyeColorOptions(language), [language]);

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

  const clearFieldAndApply = (field: keyof SearchFilters) => {
    const nextValues = { ...getValues(), [field]: '' };
    setValue(field, '', { shouldDirty: true, shouldTouch: true });
    onApplyFilters(nextValues, { shouldScroll: false, imageFile: searchImage });
  };

  const clearAllAndReset = () => {
    reset(defaultSearchFilters);
    onApplyFilters(defaultSearchFilters, { shouldScroll: false, imageFile: null });
    setSearchImage(null);
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
    onApplyFilters(values, { imageFile: searchImage });
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
          <ImageUpload
            label={t('search.uploadImage') || 'Upload Image for AI Recognition'}
            onImageChange={(file) => setSearchImage(file)}
            title={t('search.uploadSpaceTitle') || 'Click to Upload Photo'}
            dragDropText={t('search.dragDrop') || 'or drag and drop'}
            subtitle={t('search.uploadHint') || 'JPG, PNG up to 10MB'}
            buttonText={t('search.chooseFile') || 'Choose File'}
            changeText={t('search.changePhoto') || 'Change Photo'}
            removeText={t('search.remove') || 'Remove'}
            initialImage={initialImagePreview}
          />
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
              labelClassName={labelClass}
              {...register('firstName')}
            />
            <FormInput
              id="lastName"
              label={renderFieldLabel(t('search.lastName') || 'Last Name', 'lastName')}
              placeholder={t('search.lastNamePlaceholder') || 'Enter last name'}
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
              labelClassName={labelClass}
              {...register('location')}
            />
          </div>

          <FormTextArea
            id="clothing"
            label={renderFieldLabel(t('search.clothing') || 'Clothing Description', 'clothing')}
            placeholder={t('search.clothingPlaceholder') || 'Describe what they were wearing...'}
            labelClassName={labelClass}
            rows={3}
            {...register('clothing')}
          />
        </div>

        <SubmitButton type="submit">
          <Search className="h-5 w-5" />
          {t('search.searchButton') || 'Search'}
        </SubmitButton>
        <ErrorMessage msg={submitError} />
      </form>
    </div>
  );
}
