


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ChevronRight, Fingerprint, BellRing } from 'lucide-react';
import { loginSchema } from '../Validation/ValidationSchema';
import * as z from 'zod';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '../components/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';

const Login = () => {
    const { language } = useLanguage();
    const content = language === 'ar' ? ar.login : en.login;
    const isRTL = language === 'ar';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    
    // State to hold validation errors
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form using Zod safely
        const validationResult = loginSchema.safeParse(formData);
        
        if (!validationResult.success) {
            const formattedErrors: { [key: string]: string } = {};
            // Safely iterate through the Zod issues
            validationResult.error.issues.forEach((err) => {
                if (err.path[0]) {
                    formattedErrors[err.path[0].toString()] = err.message;
                }
            });
            setErrors(formattedErrors);
            return;
        }

        setErrors({}); // clear errors
        
        console.log('Login submission:', formData);
        // Add actual submit logic here later
    };

    // Helper component to render errors
    const FieldError = ({ error }: { error?: string }) => {
        if (!error) return null;
        return <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{error}</p>;
    };

    const inputClasses = (hasError: boolean) => 
        `w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 bg-gray-50/50 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all font-medium backdrop-blur-sm shadow-sm hover:border-gray-300 ${
            hasError 
            ? "border-red-400 focus:ring-red-500/50 focus:border-red-500/50" 
            : "border-gray-200/80 focus:ring-secondary/50 focus:border-secondary"
        }`;

    return (
        <div className={`min-h-screen flex bg-[#f8fafc] font-sans text-gray-900 relative overflow-hidden ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Accent Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* Left Section: Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-8 z-10 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`w-full max-w-[600px] px-6 sm:px-14 lg:px-20 ${isRTL ? 'lg:-translate-x-7' : 'lg:translate-x-7'} bg-white/80 backdrop-blur-xl py-10 rounded-[2.5rem] shadow-2xl border border-white/50`}
                >
                    
                    <div className={`mb-8 ${isRTL ? 'lg:translate-x-12' : 'lg:-translate-x-12'}`}>
                        <PageHeader showArrow={true} title={content.title} subtitle={content.subtitle} />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative group">
                                <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 z-10 pointer-events-none transition-colors ${errors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-secondary group-hover:text-slate-600'}`} strokeWidth={2.5} />
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder={content.email} 
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.email)}
                                />
                            </div>
                            <FieldError error={errors.email} />
                        </div>
                        
                        <div>
                            <div className="relative group">
                                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 z-10 pointer-events-none transition-colors ${errors.password ? 'text-red-500' : 'text-slate-400 group-focus-within:text-secondary group-hover:text-slate-600'}`} strokeWidth={2.5} />
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder={content.password} 
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.password)}
                                />
                            </div>
                            <FieldError error={errors.password} />
                        </div>
                        
                        <div className="pt-6">
                            <button 
                                type="submit" 
                                className="group relative w-full flex justify-center h-14 items-center gap-3 border border-transparent text-lg font-black rounded-xl text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary shadow-2xl shadow-secondary/20 transition-all overflow-hidden cursor-pointer"
                            >
                                <span className={`absolute inset-0 w-full h-full bg-white/20 ${isRTL ? 'translate-x-full group-hover:-translate-x-full' : '-translate-x-full group-hover:translate-x-full'} transition-transform duration-700 ease-in-out`}></span>
                                <span className="relative flex items-center gap-2">
                                    {content.signIn}
                                    <ChevronRight className={`w-5 h-5 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                                </span>
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                        {content.noAccount} <Link to="/SignUp" className={`text-primary-500 hover:text-tertiary hover:underline font-bold ${isRTL ? 'mr-1' : 'ml-1'} transition-colors`}>{content.signUp}</Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Section: Creative Visuals */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                {/* Background Image with Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url('/dist/assets/signup image.jpg')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-[#1e293b]/80 to-purple-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-grid-slate-800/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                
                {/* Content Container */}
                <div className="relative z-10 w-full max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                            {content.bringing} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">{content.families}</span><br/> {content.backTogether}
                        </h2>
                        <p className="text-lg text-blue-100/80 mb-12 font-light leading-relaxed">
                            {content.joinRevolutionary}
                        </p>

                        <div className="flex flex-col gap-6 relative">
                            {/* Connector Line */}
                            <div className={`absolute ${isRTL ? 'right-[24px]' : 'left-[24px]'} top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/50 to-purple-500/50 hidden sm:block`}></div>

                            {/* Feature 1 */}
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="flex items-start gap-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r text-white from-yellow-400 to-amber-500 flex items-center justify-center text-blue-400 backdrop-blur-md border border-blue-500/30">
                                    <Fingerprint size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{content.aiFaceMatching}</h3>
                                    <p className="text-blue-200/70 text-sm">{content.aiFaceDesc}</p>
                                </div>
                            </motion.div>

                            {/* Feature 2 */}
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className={`flex items-start gap-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl mx-0 ${isRTL ? 'sm:mr-8' : 'sm:ml-8'}`}
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white flex items-center justify-center text-amber-400 backdrop-blur-md border border-amber-500/30">
                                    <BellRing size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{content.realTimeAlerts}</h3>
                                    <p className="text-blue-200/70 text-sm">{content.realTimeDesc}</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
