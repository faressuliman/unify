import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowUpRight, ArrowUpLeft, Eye, EyeOff } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import SubmitButton from '@/components/ui/SubmitButton';
import FormInput from '@/components/ui/FormInput';
import compassImg from '../assets/compass.jpg';
import PrivacyBadge from '@/components/ui/PrivacyBadge';
import { resetPasswordSchema } from '../validation';

const getPasswordStrength = (password: string, content: any) => {
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
    const contentLogin = language === 'ar' ? ar.login : en.login;
    const contentSignup = language === 'ar' ? ar.signup : en.signup;
    const isRTL = language === 'ar';
    const localizeError = (message: string) => {
        return contentSignup.validation[message as keyof typeof contentSignup.validation] ?? message;
    };

    const pageTitle = isRTL ? 'إعادة ضبط كلمة المرور' : 'Reset Password';
    const pageSubtitle = isRTL ? 'أدخل كلمة المرور الجديدة لحسابك لتتمكن من تسجيل الدخول.' : 'Enter a new password for your account to sign in.';

    const [formData, setFormData] = useState({
        password: '',
        confirm_password: '',
    });
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPasswords, setShowPasswords] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationResult = resetPasswordSchema.safeParse(formData);
        
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
        console.log('Reset Password submission:', formData);
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
                            navigatedTo={pageTitle}
                            title={pageTitle}
                            subtitle={pageSubtitle}
                            className="mb-8 w-full"
                        />
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className={`text-xs font-bold ${getPasswordStrength(formData.password, contentSignup).textColor}`}>{getPasswordStrength(formData.password, contentSignup).text}</span>
                                        <span className="text-xs font-semibold text-slate-500">{getPasswordStrength(formData.password, contentSignup).score}/4</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getPasswordStrength(formData.password, contentSignup).color} transition-all duration-300 ease-out`} 
                                            style={{ width: `${(getPasswordStrength(formData.password, contentSignup).score / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                    {getPasswordStrength(formData.password, contentSignup).missing.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            {contentSignup.needs} {getPasswordStrength(formData.password, contentSignup).missing.join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}
                            <ErrorMessage msg={errors.password} className="text-[11px] sm:text-xs" />
                        </div>
                        
                        <div>
                            <FormInput 
                                label={contentSignup.confirmPassword}
                                icon={<Lock className="w-4 h-4" />}
                                type={showPasswords ? "text" : "password"} 
                                name="confirm_password"
                                placeholder={contentSignup.confirmPassword} 
                                value={formData.confirm_password}
                                onChange={handleChange}
                                isRTL={isRTL}
                                className={`${errors.confirm_password ? 'border-red-400 focus:ring-red-500/50' : 'border-gray-200/80 focus:border-secondary'} ${isRTL ? 'pl-11!' : 'pr-11!'}`}
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
                            <ErrorMessage msg={errors.confirm_password} className="text-[11px] sm:text-xs" />
                        </div>

                        <div className="pt-6">
                            <SubmitButton type="submit">
                                {pageTitle}
                            </SubmitButton>
                        </div>
                    </form>

                    <PrivacyBadge />

                    <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                        {isRTL ? 'تذكرت كلمة المرور؟' : 'Remembered your password?'} <Link to="/login" className={`text-tertiary font-bold hover:underline hover:decoration-secondary transition-all ${isRTL ? 'mr-1' : 'ml-1'}`}>{contentLogin.signIn} {isRTL ? <ArrowUpLeft className="w-4 h-4 text-secondary inline-block align-middle ml-1" /> : <ArrowUpRight className="w-4 h-4 text-secondary inline-block align-middle ml-1" />}</Link>
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
                            {contentLogin.heroTitle}
                        </h2>
                        <p className="text-lg text-blue-100/80 font-light leading-relaxed">
                            {contentLogin.heroSubtitle}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
