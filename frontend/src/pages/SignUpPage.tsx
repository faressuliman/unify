


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Phone, Lock, ChevronRight, Fingerprint, BellRing } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import { signUpSchema } from '../Validation/ValidationSchema';
import * as z from 'zod';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '../components/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';

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

const SignUp = () => {
    const { language } = useLanguage();
    const content = language === 'ar' ? ar.signup : en.signup;
    const isRTL = language === 'ar';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        age: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        idPicture: null
    });
    
    // State to hold validation errors
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [idPicturePreview, setIdPicturePreview] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        
        let parsedValue = value;
        // Restrict Age and PhoneNumber to digits only
        if (name === 'age' || name === 'phoneNumber') {
            parsedValue = value.replace(/\D/g, ''); 
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : parsedValue
        }));
        
        if (name === 'idPicture' && files && files[0]) {
            const reader = new FileReader();
            reader.onload = () => setIdPicturePreview(reader.result as string);
            reader.readAsDataURL(files[0]);
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRemoveIdPicture = () => {
        setFormData(prev => ({ ...prev, idPicture: null }));
        setIdPicturePreview('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form using Zod safely
        const validationResult = signUpSchema.safeParse(formData);
        
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
        
        console.log('Form submission:', formData);
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
                   <PageHeader showArrow={true} title={content.title} subtitle={content.subtitle}/>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative group">
                                <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 z-10 pointer-events-none transition-colors ${errors.fullName ? 'text-red-500' : 'text-slate-400 group-focus-within:text-secondary group-hover:text-slate-600'}`} strokeWidth={2.5} />
                                <input 
                                    type="text" 
                                    name="fullName"
                                    placeholder={content.fullName} 
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.fullName)}
                                />
                            </div>
                            <FieldError error={errors.fullName} />
                        </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="relative group">
                                    <Calendar className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 z-10 pointer-events-none transition-colors ${errors.age ? 'text-red-500' : 'text-slate-400 group-focus-within:text-secondary group-hover:text-slate-600'}`} strokeWidth={2.5} />
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        name="age"
                                        placeholder={content.age} 
                                        value={formData.age}
                                        onChange={handleChange}
                                        className={inputClasses(!!errors.age)}
                                    />
                                </div>
                                <FieldError error={errors.age} />
                            </div>
                            <div>
                                <div className="relative group">
                                    <Phone className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 z-10 pointer-events-none transition-colors ${errors.phoneNumber ? 'text-red-500' : 'text-slate-400 group-focus-within:text-secondary group-hover:text-slate-600'}`} strokeWidth={2.5} />
                                    <input 
                                        type="tel" 
                                        name="phoneNumber"
                                        placeholder={content.phone} 
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={inputClasses(!!errors.phoneNumber)}
                                    />
                                </div>
                                <FieldError error={errors.phoneNumber} />
                            </div>
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
                            {formData.password && (
                                <div className="mt-2.5 px-1 font-sans">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className={`text-xs font-bold ${getPasswordStrength(formData.password, content).textColor}`}>{getPasswordStrength(formData.password, content).text}</span>
                                        <span className="text-xs font-semibold text-slate-500">{getPasswordStrength(formData.password, content).score}/4</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getPasswordStrength(formData.password, content).color} transition-all duration-300 ease-out`} 
                                            style={{ width: `${(getPasswordStrength(formData.password, content).score / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                    {getPasswordStrength(formData.password, content).missing.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            {content.needs} {getPasswordStrength(formData.password, content).missing.join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}
                            <FieldError error={errors.password} />
                        </div>
                        <div>
                            <div className="relative group">
                                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 z-10 pointer-events-none transition-colors ${errors.confirmPassword ? 'text-red-500' : 'text-slate-400 group-focus-within:text-secondary group-hover:text-slate-600'}`} strokeWidth={2.5} />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder={content.confirmPassword} 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.confirmPassword)}
                                />
                            </div>
                            <FieldError error={errors.confirmPassword} />
                        </div>
                        
                        {/* File Upload Section */}
                        <div className="pt-2">
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                {content.verifyIdentity}
                            </label>
                            <div className={`rounded-2xl border-2 border-dashed ${errors.idPicture ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'} p-6 text-center transition-all`}>
                                <AnimatePresence mode="wait">
                                    {idPicturePreview ? (
                                        <motion.div 
                                            key="preview"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="space-y-4"
                                        >
                                            <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                                                <img src={idPicturePreview} alt="ID Preview" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center gap-2 font-sans">
                                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 active:scale-95">
                                                    <FontAwesomeIcon icon={faImage} className={isRTL ? "ml-2 text-slate-400" : "mr-2 text-slate-400"} />
                                                    <span>{content.change}</span>
                                                    <input
                                                        type="file"
                                                        name="idPicture"
                                                        accept="image/*"
                                                        onChange={handleChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveIdPicture}
                                                    className="inline-flex items-center gap-2 hover:cursor-pointer rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className={isRTL ? "ml-2" : "mr-2"} />
                                                    <span>{content.remove}</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="upload"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="mb-4 flex items-center justify-center">
                                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3c7] shadow-sm">
                                                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-xl text-black" />
                                                </span>
                                            </div>
                                            <p className="mb-1 text-sm font-bold text-slate-700 font-sans">{content.uploadId} <span className='font-semibold'>{content.dragDrop}</span></p>
                                            <p className="mb-5 text-xs text-slate-400 font-sans">{content.uploadHint}</p>

                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#fde68a] hover:scale-[1.02] active:scale-95">
                                                <span>{content.browseFiles}</span>
                                                <input
                                                    type="file"
                                                    name="idPicture"
                                                    accept="image/*"
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <FieldError error={errors.idPicture} />
                        </div>
                        
                        <div className="pt-6">
                            <button 
                                type="submit" 
                                className="group relative w-full flex justify-center h-14 items-center gap-3 border border-transparent text-lg font-black rounded-xl text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary shadow-2xl shadow-secondary/20 transition-all overflow-hidden cursor-pointer"
                            >
                                <span className={`absolute inset-0 w-full h-full bg-white/20 ${isRTL ? 'translate-x-full group-hover:-translate-x-full' : '-translate-x-full group-hover:translate-x-full'} transition-transform duration-700 ease-in-out`}></span>
                                <span className="relative flex items-center gap-2">
                                    {content.createAccount}
                                    <ChevronRight className={`w-5 h-5 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                                </span>
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                        {content.alreadyHaveAccount} <Link to="/login" className={`text-primary-500 hover:text-tertiary hover:underline font-bold transition-colors ${isRTL ? 'mr-1' : 'ml-1'}`}>{content.signIn}</Link>
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

export default SignUp;
