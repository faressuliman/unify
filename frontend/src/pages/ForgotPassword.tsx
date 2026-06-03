


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight, ArrowUpLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';
import SubmitButton from '@/components/ui/SubmitButton';
import FormInput from '@/components/ui/FormInput';
import PrivacyBadge from '@/components/ui/PrivacyBadge';
import ErrorMessage from '@/components/ui/ErrorMessage';
import compassImg from '../assets/compass.jpg';
import { useLanguage } from '../context/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import { forgotPasswordSchema } from '../validation';
import { authApi, ApiError } from '@/lib/api';

const ForgetPassword = () => {
    const { language } = useLanguage();
    const content = language === 'ar' ? ar.login : en.login; // Using login strings as fallback
    const isRTL = language === 'ar';
    const navigate = useNavigate();
    const localizeError = (message: string) => {
        return content.validation[message as keyof typeof content.validation] ?? message;
    };

    const pageTitle = isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?';
    const pageSubtitle = isRTL 
        ? 'أدخل البريد الإلكتروني المستخدم لحسابك وسنرسل لك رابطًا لإعادة تعيين كلمة المرور' 
        : "Enter the email used for your account and we'll send you a link to reset your password";
    
    const navText = isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login';

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationResult = forgotPasswordSchema.safeParse({ email });

        if (!validationResult.success) {
            const firstIssue = validationResult.error.issues[0];
            setError(localizeError(firstIssue?.message ?? ''));
            return;
        }

        setError('');
        setSubmitError('');
        setIsSubmitting(true);

        try {
            await authApi.forgotPassword({ email });
            setSuccess(true);
            toast.success(isRTL ? 'تم إرسال رابط إعادة التعيين' : 'Reset link sent successfully!', {
                description: isRTL ? 'تحقق من بريدك الإلكتروني للحصول على رمز OTP' : 'Check your email for the OTP code',
                duration: 4000,
            });
            setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
        } catch (submitErr) {
            setSubmitError(submitErr instanceof ApiError ? submitErr.message : 'Failed to send reset OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`flex min-h-[calc(100vh-120px)] bg-[#f8fafc] font-sans text-gray-900 relative overflow-hidden ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full lg:w-1/2 flex flex-col justify-center lg:justify-start lg:pt-20 pb-8 z-10 relative min-h-[calc(100vh-120px)] lg:min-h-0">
                <div className={`w-full lg:max-w-200 px-6 lg:px-12 flex flex-col items-start text-start ${isRTL ? 'lg:mr-auto' : 'lg:ml-auto'} pt-10 sm:pt-12 lg:pt-0`}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:max-w-150"
                    >
                        <PageHeader
                            showArrow={true}
                            navigatedTo={navText}
                            title={pageTitle}
                            subtitle={pageSubtitle}
                            className="mb-8 w-full"
                        />
                        {isSubmitting ? (
                        <div className="flex-1 flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="inline-block"
                                >
                                    <Loader2 className="w-12 h-12 text-secondary" />
                                </motion.div>
                                <p className="text-gray-600 font-medium">{isRTL ? 'جاري إرسال رابط إعادة التعيين...' : 'Sending reset link...'}</p>
                            </div>
                        </div>
                    ) : !success ? (
                        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                            {submitError ? <ErrorMessage msg={submitError} className="text-sm" /> : null}
                            <div>
                                <FormInput 
                                    label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                                    icon={<Mail className="w-4 h-4" />}
                                    type="email" 
                                    name="email"
                                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); setSubmitError(''); }}
                                    isRTL={isRTL}
                                    disabled={isSubmitting}
                                    className={error ? 'border-red-400 focus:ring-red-500/50 flex-1 py-4 text-base' : 'border-gray-200/80 focus:border-secondary flex-1 py-4 text-base'}
                                />
                                <ErrorMessage msg={error} className="text-[11px] sm:text-xs mt-1" />
                            </div>

                            <div className="pt-2 lg:pt-6">
                                <SubmitButton type="submit" className="py-4 text-base" disabled={isSubmitting}>
                                    {isSubmitting ? (isRTL ? 'جارٍ الإرسال...' : 'Sending...') : (isRTL ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')}
                                </SubmitButton>
                            </div>
                        </form>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-4 my-8 lg:mb-8"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2">{isRTL ? 'تفقد بريدك الإلكتروني' : 'Check your email'}</h3>
                                <p className="text-[15px] opacity-90 leading-relaxed">
                                    {isRTL 
                                        ? 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى ' 
                                        : 'We have sent a password reset link to '}
                                    <span className="font-semibold block mt-1">{email}</span>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <div className="mt-12 lg:mt-8">
                        <PrivacyBadge />
                    </div>

                    <p className="text-center text-[15px] text-gray-500 mt-10 md:mt-8 font-medium">
                        {isRTL ? 'تذكرتها؟' : 'Remembered it?'} 
                        <Link to="/login" className={`text-tertiary font-bold hover:underline hover:decoration-secondary transition-all ${isRTL ? 'mr-1' : 'ml-1'}`}>
                            {content.signIn} 
                            {isRTL ? <ArrowUpLeft className="w-5 h-5 text-secondary inline-block align-middle ml-1" /> : <ArrowUpRight className="w-5 h-5 text-secondary inline-block align-middle ml-1" />}
                        </Link>
                    </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Section: Creative Visuals */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${compassImg})` }}
                ></div>
                <div className="absolute inset-0 bg-linear-to-tr from-slate-900/90 via-slate-800/80 to-secondary/30"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-24 h-24 mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
                    >
                        <Mail className="w-10 h-10 text-blue-300" strokeWidth={1.5} />
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight"
                    >
                        {isRTL ? 'استعادة الوصول' : 'Regain Access'}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg text-blue-100/80 font-light leading-relaxed"
                    >
                        {isRTL 
                            ? 'لا تقلق، يحدث ذلك للجميع. أدخل بريدك الإلكتروني وسنساعدك في استعادة حسابك بسرعة وأمان.' 
                            : 'Don\'t worry, it happens to everyone. Enter your email and we\'ll help you get back into your account quickly and securely.'}
                    </motion.p>
                </div>

                {/* Decorative Elements */}
                <motion.div 
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full border border-white/10"
                />
                <motion.div 
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0], scale: [1, 1.1, 1] }} 
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full border border-white/5 bg-white/5 backdrop-blur-md"
                />
            </div>
        </div>
    );
};

export default ForgetPassword;
