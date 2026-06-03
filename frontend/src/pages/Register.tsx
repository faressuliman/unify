import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Fingerprint, BellRing, ArrowUpRight, ArrowUpLeft, Eye, EyeOff } from 'lucide-react';
import { signUpSchema } from '../validation';
import PageHeader from '@/components/ui/PageHeader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import SubmitButton from '@/components/ui/SubmitButton';
import FormInput from '@/components/ui/FormInput';
import ImageUpload from '@/components/ui/ImageUpload';
import LocalizedDateInput from '@/components/ui/LocalizedDateInput';
import SelectMenu from '@/components/ui/SelectMenu';
import compassImg from '../assets/compass.jpg';
import FeatureCard from '@/components/ui/FeatureCard';
import PrivacyBadge from '@/components/ui/PrivacyBadge';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../data/cities';

type PasswordStrengthContent = {
    pwd8Chars: string;
    pwdUpper: string;
    pwdNumber: string;
    pwdSpecial: string;
    pwdNone: string;
    pwdWeak: string;
    pwdFair: string;
    pwdGood: string;
    pwdStrong: string;
};

const getPasswordStrength = (password: string, content: PasswordStrengthContent) => {
    let score = 0;
    const missing: string[] = [];
    
    if (password.length >= 8) score += 1;
    else missing.push(content.pwd8Chars);

    if (/[A-Z]/.test(password)) score += 1;
    else missing.push(content.pwdUpper);

    if (/[0-9]/.test(password)) score += 1;
    else missing.push(content.pwdNumber);

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else missing.push(content.pwdSpecial);

    let color = "bg-slate-200";
    let textColor = "text-slate-500";
    let text = content.pwdNone;
    
    if (password.length > 0) {
        if (score === 1) { color = "bg-red-500"; textColor = "text-red-500"; text = content.pwdWeak; }
        else if (score === 2) { color = "bg-orange-400"; textColor = "text-orange-400"; text = content.pwdFair; }
        else if (score === 3) { color = "bg-blue-500"; textColor = "text-blue-500"; text = content.pwdGood; }
        else if (score === 4) { color = "bg-green-500"; textColor = "text-green-500"; text = content.pwdStrong; }
    }

    return { score, missing, color, textColor, text };
};

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { language } = useLanguage();
    const content = language === 'ar' ? ar.signup : en.signup;
    const isRTL = language === 'ar';
    const passwordStrengthContent: PasswordStrengthContent = {
        pwd8Chars: content.pwd8Chars,
        pwdUpper: content.pwdUpper,
        pwdNumber: content.pwdNumber,
        pwdSpecial: content.pwdSpecial,
        pwdNone: content.pwdNone,
        pwdWeak: content.pwdWeak,
        pwdFair: content.pwdFair,
        pwdGood: content.pwdGood,
        pwdStrong: content.pwdStrong,
    };
    const localizeError = (message: string) => {
        return content.validation[message as keyof typeof content.validation] ?? message;
    };

    const [formData, setFormData] = useState<{
        fullName: string;
        email: string;
        city: string;
        birthDate: string;
        phoneNumber: string;
        password: string;
        confirmPassword: string;
        idPicture: File | null;
    }>({
        fullName: '',
        email: '',
        city: '',
        birthDate: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        idPicture: null
    });
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPasswords, setShowPasswords] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cityOptions = useMemo(() => {
        const labels = isRTL ? EGYPTIAN_CITIES_AR : EGYPTIAN_CITIES;
        return [
            { value: '', label: content.cityPlaceholder || content.city },
            ...EGYPTIAN_CITIES.map((city, idx) => ({
                value: city,
                label: labels[idx] ?? city,
            })),
        ];
    }, [content.city, content.cityPlaceholder, isRTL]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let parsedValue = value;
        if (name === 'phoneNumber') {
            parsedValue = value.replace(/\D/g, ''); 
        }

        if (name === 'phoneNumber' && parsedValue.length > 11) {
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: parsedValue
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBirthDateChange = (value: string) => {
        setFormData(prev => ({ ...prev, birthDate: value }));
        if (errors.birthDate) {
            setErrors(prev => ({ ...prev, birthDate: '' }));
        }
    };

    const handleCityChange = (value: string) => {
        setFormData(prev => ({ ...prev, city: value }));
        if (errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationResult = signUpSchema.safeParse(formData);
        
        if (!validationResult.success) {
            const formattedErrors: { [key: string]: string } = {};
            validationResult.error.issues.forEach((err) => {
                if (err.path[0]) {
                    formattedErrors[err.path[0].toString()] = localizeError(err.message);
                }
            });
            setErrors(formattedErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        const loadingToastId = toast.loading(
            isRTL
                ? 'جاري التحقق من صحة بطاقة الهوية، قد يستغرق ذلك لحظات.'
                : 'Verifying ID authenticity, this may take a moment.'
        );

        try {
            await register({
                name: formData.fullName,
                email: formData.email,
                city: formData.city,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phoneNumber: formData.phoneNumber,
                birthDate: formData.birthDate,
                idPicture: formData.idPicture,
            });
            // Account is created in a "pending verification" state on the
            // backend — surface that explicitly so the user knows why they
            // can't log in immediately and that we'll email them.
            toast.success(
                isRTL ? 'تم إنشاء حسابك بنجاح' : 'Account created successfully',
                {
                    description: isRTL
                        ? 'حسابك قيد المراجعة. سنُرسل لك بريداً إلكترونياً فور اعتماد فريقنا لوثيقة الهوية.'
                        : "Your account is pending verification. We'll email you as soon as our team reviews your ID.",
                    duration: 8000,
                },
            );
            navigate('/');
        } catch (error) {
            const errorMsg = error instanceof ApiError ? error.message : 'Unable to create account right now.';
            const normalized = errorMsg.toLowerCase();
            
            if (normalized.includes('account banned')) {
                toast.error(isRTL ? 'حسابك محظور من المنصة' : 'Your account is banned from the platform');
            } else if (errorMsg.includes('AI-generated') || errorMsg.includes('identity document')) {
                toast.error(isRTL ? 'فشل التسجيل' : 'Registration Blocked', {
                    description: isRTL ? 'يبدو أن الوثيقة المرفقة تم إنشاؤها عبر الذكاء الاصطناعي.' : errorMsg,
                    duration: 6000,
                });
            } else {
                toast.error(isRTL ? 'تعذر إنشاء الحساب حالياً.' : errorMsg);
            }
        } finally {
            toast.dismiss(loadingToastId);
            setIsSubmitting(false);
        }
    };

    return (
       
        <div className={`flex min-h-[calc(100vh-80px)] bg-[#f8fafc] font-sans text-gray-900 relative overflow-hidden ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full lg:w-1/2 flex flex-col justify-start pt-8 lg:pt-12 pb-12 z-10 relative">
                <div className={`w-full lg:max-w-200 px-6 lg:px-12 flex flex-col items-start text-start ${isRTL ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:max-w-150"
                    >
                        <PageHeader
                            showArrow={true}
                            navigatedTo={content.title}
                            title={content.title}
                            subtitle={content.subtitle}
                            className="mb-8 w-full"
                        />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <FormInput 
                                icon={<User className="w-4 h-4" />}
                                type="text" 
                                name="fullName"
                                label={content.fullName}
                                placeholder={content.fullName} 
                                value={formData.fullName}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={errors.fullName ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'}
                            />
                            <ErrorMessage msg={errors.fullName} className="text-[11px] sm:text-xs" />
                        </div>

                        <div>
                            <FormInput 
                                icon={<Mail className="w-4 h-4" />}
                                type="email" 
                                name="email"
                                label={content.email}
                                placeholder={content.email} 
                                value={formData.email}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={errors.email ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'}
                            />
                            <ErrorMessage msg={errors.email} className="text-[11px] sm:text-xs" />
                        </div>

                        <div>
                            <SelectMenu
                                id="city"
                                label={content.city}
                                value={formData.city}
                                options={cityOptions}
                                onChange={handleCityChange}
                                isRTL={isRTL}
                            />
                            <ErrorMessage msg={errors.city} className="text-[11px] sm:text-xs" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <LocalizedDateInput
                                    id="birthDate"
                                    label={content.birthDate}
                                    value={formData.birthDate}
                                    onChange={handleBirthDateChange}
                                    isRTL={isRTL}
                                    placeholder={content.birthDatePlaceholder || content.birthDate}
                                />
                                <ErrorMessage msg={errors.birthDate} className="text-[11px] sm:text-xs" />
                            </div>
                            <div>
                                <FormInput 
                                    icon={<Phone className="w-4 h-4" />}
                                    type="tel" 
                                    name="phoneNumber"
                                    label={content.phone}
                                    placeholder={content.phone} 
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    maxLength={11}
                                    isRTL={isRTL}
                                    className={`${errors.phoneNumber ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'} ${isRTL ? 'text-right placeholder:text-right' : ''}`}
                                />
                                <ErrorMessage msg={errors.phoneNumber} className="text-[11px] sm:text-xs" />
                            </div>
                        </div>

                        <div>
                            <FormInput 
                                icon={<Lock className="w-4 h-4" />}
                                type={showPasswords ? 'text' : 'password'} 
                                name="password"
                                label={content.password}
                                placeholder={content.password} 
                                value={formData.password}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={`${errors.password ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'} ${isRTL ? 'pl-11!' : 'pr-11!'}`}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className={`absolute flex items-center justify-center ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-md hover:bg-gray-100 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors z-10 cursor-pointer`}
                                    >
                                        {showPasswords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            {formData.password && (
                                <div className="mt-2.5 px-1 font-sans">
                                    {(() => {
                                        const strength = getPasswordStrength(formData.password, passwordStrengthContent);
                                        return (
                                            <>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className={`text-xs font-bold ${strength.textColor}`}>{strength.text}</span>
                                        <span className="text-xs font-semibold text-slate-500">{strength.score}/4</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${strength.color} transition-all duration-300 ease-out`} 
                                            style={{ width: `${(strength.score / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                    {strength.missing.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            {content.needs} {strength.missing.join(", ")}
                                        </p>
                                    )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                            <ErrorMessage msg={errors.password} className="text-[11px] sm:text-xs" />
                        </div>

                        <div>
                            <FormInput 
                                icon={<Lock className="w-4 h-4" />}
                                type={showPasswords ? 'text' : 'password'} 
                                name="confirmPassword"
                                label={content.confirmPassword}
                                placeholder={content.confirmPassword} 
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={`${errors.confirmPassword ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'} ${isRTL ? 'pl-11!' : 'pr-11!'}`}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className={`absolute flex items-center justify-center ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-md hover:bg-gray-100 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors z-10 cursor-pointer`}
                                    >
                                        {showPasswords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            <ErrorMessage msg={errors.confirmPassword} className="text-[11px] sm:text-xs" />
                        </div>
                        
                        <div className="text-start">
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {content.verifyIdentity}
                            </label>
                            <ImageUpload
                                onImageChange={(file) => setFormData((prev) => ({ ...prev, idPicture: file }))}
                                title={content.uploadId}
                                dragDropText={content.dragDrop}
                                subtitle={content.uploadHint}
                                buttonText={content.browseFiles}
                                changeText={content.change}
                                removeText={content.remove}
                            />
                            <ErrorMessage msg={errors.idPicture} className="text-[11px] sm:text-xs" />
                        </div>
                        
                        <div className="pt-2">
                            <SubmitButton type="submit" isLoading={isSubmitting}>
                                {isSubmitting ? content.creatingAccount : content.createAccount}
                            </SubmitButton>
                        </div>
                    </form>

                    <PrivacyBadge />

                    <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                        {content.alreadyHaveAccount} <Link to="/login" className={`text-tertiary font-bold hover:underline hover:decoration-secondary transition-all ${isRTL ? 'mr-1' : 'ml-1'}`}>{content.signIn} {isRTL ? <ArrowUpLeft className="w-4 h-4 text-secondary inline-block align-middle ml-1" /> : <ArrowUpRight className="w-4 h-4 text-secondary inline-block align-middle ml-1" />}</Link>
                    </p>
                    </motion.div>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${compassImg})` }}
                ></div>
                <div className="absolute inset-0 bg-linear-to-tr from-slate-900/90 via-slate-800/80 to-secondary/30"></div>
                <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-position-[bottom_1px_center] mask-[linear-gradient(to_bottom,transparent,black)]"></div>
                
                <div className="relative z-10 w-full max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                            {content.bringing} <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500">{content.families}</span><br/> {content.backTogether}
                        </h2>
                        <p className="text-lg text-blue-100/80 mb-12 font-light leading-relaxed">
                            {content.joinRevolutionary}
                        </p>

                        <div className="flex flex-col gap-10 relative mt-12 pl-2">
                            <div className={`absolute ${isRTL ? 'right-9' : 'left-9'} top-8 bottom-4 w-0.5 bg-linear-to-b from-secondary/60 via-secondary/20 to-transparent hidden sm:block rounded-full`}></div>

                            <FeatureCard 
                                icon={<Fingerprint className="w-7 h-7" />}
                                title={content.aiFaceMatching}
                                desc={content.aiFaceDesc}
                            />

                            <FeatureCard 
                                icon={<BellRing className="w-7 h-7" />}
                                title={content.realTimeAlerts}
                                desc={content.realTimeDesc}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
