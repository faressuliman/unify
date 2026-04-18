import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SubmitButton from '@/components/ui/SubmitButton';
import FormInput from '@/components/ui/FormInput';
import compassImg from '../assets/compass.jpg';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowUpRight, ArrowUpLeft, Eye, EyeOff } from 'lucide-react';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { loginSchema } from '../validation';
import PageHeader from '@/components/ui/PageHeader';
import PrivacyBadge from '@/components/ui/PrivacyBadge';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '@/lib/api';
import { en } from '../data/english';
import { ar } from '../data/arabic';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { language } = useLanguage();
    const content = language === 'ar' ? ar.login : en.login;
    const isRTL = language === 'ar';
    const localizeError = (message: string) => {
        return content.validation[message as keyof typeof content.validation] ?? message;
    };

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitError('');

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationResult = loginSchema.safeParse(formData);
        
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
        setSubmitError('');
        setIsSubmitting(true);

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (error) {
            setSubmitError(error instanceof ApiError ? error.message : 'Unable to log in right now.');
        } finally {
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
                            navigatedTo={content.signIn}
                            title={content.title}
                            subtitle={content.subtitle}
                            className="mb-8 w-full"
                        />
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {submitError ? <ErrorMessage msg={submitError} className="text-sm" /> : null}
                        <div>
                            <FormInput 
                                label={content.email}
                                icon={<Mail className="w-4 h-4" />}
                                type="email" 
                                name="email"
                                placeholder={content.email} 
                                value={formData.email}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={errors.email ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'}
                            />
                            <ErrorMessage msg={errors.email} className="text-[11px] sm:text-xs" />
                        </div>
                        
                        <div>
                            <FormInput 
                                label={content.password}
                                icon={<Lock className="w-4 h-4" />}
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                placeholder={content.password} 
                                value={formData.password}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={`${errors.password ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'} ${isRTL ? 'pl-11!' : 'pr-11!'}`}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute flex items-center justify-center ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-md hover:bg-gray-100 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors z-10 cursor-pointer`}
                                    >
                                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            <ErrorMessage msg={errors.password} className="text-[11px] sm:text-xs" />
                        </div>
                        
                        <div className="flex items-center justify-between -mt-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer" />
                                <label htmlFor="remember" className="text-sm text-gray-600 font-bold cursor-pointer">{content.rememberMe}</label>
                            </div>
                            <Link to="/forgot-password" className="text-sm font-bold text-tertiary hover:underline hover:decoration-secondary transition-all">{content.forgotPassword}</Link>
                        </div>

                        <div className="pt-6">
                            <SubmitButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Signing in...' : content.signIn}
                            </SubmitButton>
                        </div>
                    </form>

                    <PrivacyBadge />

                    <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                        {content.noAccount} <Link to="/register" className={`text-tertiary font-bold hover:underline hover:decoration-secondary transition-all ${isRTL ? 'mr-1' : 'ml-1'}`}>{content.signUp} {isRTL ? <ArrowUpLeft className="w-4 h-4 text-secondary inline-block align-middle ml-1" /> : <ArrowUpRight className="w-4 h-4 text-secondary inline-block align-middle ml-1" />}</Link>
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
                <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-position-[bottom_1px_center] mask-[linear-gradient(to_bottom,transparent,black)]"></div>
                
                <div className="relative z-10 w-full max-w-lg text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                            {content.heroTitle}
                        </h2>
                        <p className="text-lg text-blue-100/80 font-light leading-relaxed">
                            {content.heroSubtitle}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;