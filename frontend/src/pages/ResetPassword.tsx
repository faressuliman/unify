import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import SubmitButton from '@/components/ui/SubmitButton';
import FormInput from '@/components/ui/FormInput';
import { authApi, ApiError } from '@/lib/api';
import unifyLogo from '../assets/unify.png';

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

const ResetPassword = () => {
    const { language } = useLanguage();
    const contentSignup = language === 'ar' ? ar.signup : en.signup;
    const isRTL = language === 'ar';
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email') || '';

    const validationDict = contentSignup.validation as Record<string, string>;
    const passwordStrengthContent: PasswordStrengthContent = {
        pwd8Chars: contentSignup.pwd8Chars,
        pwdUpper: contentSignup.pwdUpper,
        pwdNumber: contentSignup.pwdNumber,
        pwdSpecial: contentSignup.pwdSpecial,
        pwdNone: contentSignup.pwdNone,
        pwdWeak: contentSignup.pwdWeak,
        pwdFair: contentSignup.pwdFair,
        pwdGood: contentSignup.pwdGood,
        pwdStrong: contentSignup.pwdStrong,
    };
    const localizeError = (message: string) => {
        return validationDict[message] ?? message;
    };

    const [step, setStep] = useState<'otp' | 'password'>('otp');
    const [formData, setFormData] = useState({
        email: emailFromQuery,
        otp: '',
        password: '',
        confirmPassword: '',
    });
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPasswords, setShowPasswords] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!emailFromQuery) {
            navigate('/forgot-password');
        }
    }, [emailFromQuery, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitError('');

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.otp.trim()) {
            setErrors({ otp: isRTL ? 'رمز OTP مطلوب' : 'OTP code is required' });
            return;
        }

        setErrors({});
        setSubmitError('');
        setIsSubmitting(true);

        try {
            await authApi.verifyOTP({
                email: formData.email,
                otp: formData.otp,
            });
            setStep('password');
            toast.success(isRTL ? 'تم التحقق من رمز OTP' : 'OTP verified successfully');
        } catch (error) {
            setSubmitError(error instanceof ApiError ? error.message : 'Invalid OTP code.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match' });
            return;
        }

        if (formData.password.length < 8) {
            setErrors({ password: isRTL ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters' });
            return;
        }

        setErrors({});
        setSubmitError('');
        setIsSubmitting(true);

        try {
            await authApi.resetPassword({
                email: formData.email,
                otp: formData.otp,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });
            toast.success(isRTL ? 'تمت إعادة تعيين كلمة المرور بنجاح' : 'Password reset successfully!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setSubmitError(error instanceof ApiError ? error.message : 'Unable to reset password right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen bg-[#f8fafc] font-sans text-gray-900 relative ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full flex flex-col justify-center items-center min-h-screen py-12 px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8 text-center flex flex-col items-center gap-4">
                        <img src={unifyLogo} alt="Unify" className="h-16 w-auto" />
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
                                {step === 'otp' ? (isRTL ? 'التحقق من الهوية' : 'Verify Identity') : (isRTL ? 'كلمة مرور جديدة' : 'New Password')}
                            </h1>
                            <p className="text-gray-600">
                                {step === 'otp' 
                                    ? (isRTL ? 'أدخل رمز OTP الذي تلقيته في بريدك الإلكتروني' : 'Enter the OTP code sent to your email')
                                    : (isRTL ? 'أدخل كلمة مرور جديدة قوية' : 'Enter a strong new password')}
                            </p>
                        </div>
                    </div>
                    
                    {step === 'otp' ? (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            {submitError ? <ErrorMessage msg={submitError} className="text-sm" /> : null}
                            <div>
                                <FormInput
                                    label={isRTL ? 'رمز OTP' : 'OTP Code'}
                                    icon={<KeyRound className="w-4 h-4" />}
                                    type="text"
                                    name="otp"
                                    placeholder={isRTL ? 'أدخل رمز OTP' : 'Enter OTP code'}
                                    value={formData.otp}
                                    onChange={handleChange}
                                    isRTL={isRTL}
                                    disabled={isSubmitting}
                                    className={errors.otp ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'}
                                />
                                <ErrorMessage msg={errors.otp} className="text-[11px] sm:text-xs" />
                            </div>

                            <div className="pt-4">
                                <SubmitButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : (isRTL ? 'التالي' : 'Next')}
                                </SubmitButton>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {submitError ? <ErrorMessage msg={submitError} className="text-sm" /> : null}

                            <div>
                                <FormInput 
                                    label={contentSignup.password}
                                    icon={<Lock className="w-4 h-4" />}
                                    type={showPasswords ? "text" : "password"} 
                                    name="password"
                                    placeholder={contentSignup.password} 
                                    value={formData.password}
                                    onChange={handleChange}
                                    isRTL={isRTL}
                                    disabled={isSubmitting}
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
                                                {contentSignup.needs} {strength.missing.join(", ")}
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
                                    label={contentSignup.confirmPassword}
                                    icon={<Lock className="w-4 h-4" />}
                                    type={showPasswords ? "text" : "password"} 
                                    name="confirmPassword"
                                    placeholder={contentSignup.confirmPassword} 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    isRTL={isRTL}
                                    disabled={isSubmitting}
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

                            <div className="pt-4">
                                <SubmitButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (isRTL ? 'جاري إعادة التعيين...' : 'Resetting...') : (isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password')}
                                </SubmitButton>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
