import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, User, MessageSquare, Send, HeartHandshake, Home, ChevronRight, ChevronLeft, ArrowDownRight, ArrowDownLeft } from 'lucide-react';
import FormInput from '@/components/ui/FormInput';
import FormTextArea from '@/components/ui/FormTextArea';
import SubmitButton from '@/components/ui/SubmitButton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useLanguage } from '../context/LanguageContext';
import compassImg from '../assets/compass.jpg';
import { contactApi } from '../lib/api';

const ContactCard = ({ icon, title, detail, delay, href }: { icon: React.ReactNode, title: string, detail: string, delay: number, href?: string }) => {
    const Wrapper = href ? motion.a : motion.div;
    return (
        <Wrapper 
            {...(href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: "noreferrer" } : {})}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-100 hover:border-secondary/20 hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer"
        >
            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-gray-900 font-bold mb-1 text-base md:text-lg">{title}</h3>
            <p className="text-gray-500 font-medium text-sm md:text-base text-center" dir="ltr">{detail}</p>
        </Wrapper>
    );
};

const Contact = () => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const t = isRTL ? {
        title: 'تواصل معنا',
        subtitle: 'نحن هنا من أجلك. رسالتك مسموعة ومهمة.',
        fullName: 'الاسم الكامل',
        fullNamePlaceholder: 'أدخل اسمك...',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'mail@example.com',
        subject: 'الموضوع',
        subjectPlaceholder: 'إلى ماذا يشير موضوعك؟',
        message: 'الرسالة',
        messagePlaceholder: 'كيف يمكننا مساعدتك أو دعمك اليوم؟',
        send: 'إرسال الرسالة',
        phone: '+20 100 123 4567',
        location: 'الإسكندرية، مصر',
        supportMail: 'support@unify.eg',
        heroTitle: 'نحن معك في كل خطوة',
        heroSubtitle: 'سواء كنت تبحث عن أحبائك، أو لديك معلومات، أو تحتاج إلى مساعدة... فريقنا هنا للاستماع.',
        callUs: 'اتصل بنا',
        emailUs: 'راسلنا',
        visitUs: 'الفرع الرئيسي',
        emergency: 'خط الطوارئ الساخن',
        emergencyDesc: 'متاح للتدخل الفوري 24/7',
        emergencyNum: '12345',
        success: 'تم إرسال رسالتك بنجاح. سنرسل لك بريداً إلكترونياً بالرد في أقرب وقت ممكن.',
        directContact: 'طرق التواصل المباشر',
        dropMessage: 'اترك لنا رسالة',
        submitError: 'فشل إرسال الرسالة، يرجى المحاولة مرة أخرى.'
    } : {
        title: 'Contact Us',
        subtitle: 'We are here for you. Your message is heard and important.',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name...',
        email: 'Email Address',
        emailPlaceholder: 'mail@example.com',
        subject: 'Subject',
        subjectPlaceholder: 'What is this regarding?',
        message: 'Message',
        messagePlaceholder: 'How can we help or support you today?',
        send: 'Send Message',
        phone: '+20 100 123 4567',
        location: 'Alexandria, Egypt',
        supportMail: 'support@unify.eg',
        heroTitle: 'We Are With You Every Step',
        heroSubtitle: 'Whether you are searching for a loved one, have a tip, or need assistance... our team is here to listen.',
        callUs: 'Call Us Now',
        emailUs: 'Email Support',
        visitUs: 'Main Office',
        emergency: 'Emergency Hotline',
        emergencyDesc: 'Available for immediate response 24/7',
        emergencyNum: '12345',
        success: 'Your message has been sent successfully. We will send you an email with our reply as soon as possible.',
        directContact: 'Direct Contact Methods',
        dropMessage: 'Drop Us a Message',
        submitError: 'Failed to send message, please try again.'
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setIsSubmitted(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) newErrors.name = isRTL ? 'الاسم مطلوب' : 'Name is required';
        if (!formData.email.trim()) newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = isRTL ? 'تنسيق البريد الإلكتروني غير صالح' : 'Invalid email format';
        if (!formData.subject.trim()) newErrors.subject = isRTL ? 'الموضوع مطلوب' : 'Subject is required';
        if (!formData.message.trim()) newErrors.message = isRTL ? 'الرسالة مطلوبة' : 'Message is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        
        try {
            await contactApi.sendMessage({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

            setErrors({});
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Failed to send message:", error);
            setErrors({ submit: t.submitError });
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 font-sans text-gray-900 relative ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Hero Header Section */}
            <div className="relative pt-20 pb-24 lg:pt-24 lg:pb-28 overflow-hidden bg-primary-dark">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${compassImg})` }}
                ></div>
                {/* Darker overlay for better contrast */}
                <div className="absolute inset-0 bg-slate-900/60"></div>
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-primary-dark/95"></div>
                <div className="absolute inset-0 bg-grid-white/[0.04] bg-position-[bottom_1px_center] mask-[linear-gradient(to_bottom,transparent,black)]"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <HeartHandshake className="w-12 h-12 text-secondary mx-auto mb-4 opacity-90 drop-shadow-lg" />
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold  mb-3 tracking-tight drop-shadow-md">
                            {t.heroTitle}
                        </h1>
                        <p className="text-sm md:text-base text-zinc-100 font-light max-w-2xl mx-auto leading-relaxed">
                            {t.heroSubtitle}
                        </p>
                        
                        <nav className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm mt-6">
                            <a href="/" className="text-zinc-100 hover:text-secondary flex items-center gap-1 transition-colors">
                                <Home className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{isRTL ? 'الرئيسية' : 'Home'}</span>
                            </a>
                            {isRTL ? (
                                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-white/50" />
                            ) : (
                                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white/50" />
                            )}
                            <span className="text-secondary font-medium">{t.title}</span>
                        </nav>
                    </motion.div>
                </div>
            </div>

            {/* Overlapping Content Section */}
            <div className="relative z-20 max-w-6xl mx-auto px-6 -mt-10 lg:-mt-12 pb-16">

                {/* Horizontal Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <ContactCard 
                        icon={<Phone className="w-5 h-5" />} 
                        title={t.callUs} 
                        detail={t.phone} 
                        delay={0.2}
                        href="tel:+201001234567"
                    />
                    <ContactCard 
                        icon={<Mail className="w-5 h-5" />} 
                        title={t.emailUs} 
                        detail={t.supportMail} 
                        delay={0.3}
                        href="mailto:support@unify.eg"
                    />
                    <ContactCard 
                        icon={<MapPin className="w-5 h-5" />} 
                        title={t.visitUs} 
                        detail={t.location} 
                        delay={0.4}
                        href="https://maps.google.com/?q=Alexandria,Egypt"
                    />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column: Form Container */}
                    <div className="text-start order-2 lg:order-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100"
                        >
                            <div className="mb-6 w-full text-start">
                                <h2 className={`text-xl md:text-2xl font-extrabold text-tertiary uppercase leading-tight mb-2 ${isRTL ? 'tracking-normal' : 'tracking-widest'} flex items-center gap-2`}>
                                    <span>{t.dropMessage}</span>
                                    {isRTL ? (
                                        <ArrowDownLeft className="w-5 h-5 md:w-6 md:h-6 text-secondary shrink-0" />
                                    ) : (
                                        <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6 text-secondary shrink-0" />
                                    )}
                                </h2>
                                <p className="text-slate-500 font-medium text-sm md:text-base">{t.subtitle}</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                    <div>
                                        <FormInput 
                                            label={t.fullName}
                                            icon={<User className="w-5 h-5" />}
                                            type="text" 
                                            name="name"
                                            placeholder={t.fullNamePlaceholder} 
                                            value={formData.name}
                                            onChange={handleChange}
                                            isRTL={isRTL}
                                            className={`transition-all shadow-sm ${errors.name ? 'border-red-400 bg-red-50/10 focus:border-red-500 focus:ring-0' : 'border-gray-200/80 bg-gray-50/50 focus:border-secondary focus:ring-0 focus:bg-white'}`}
                                        />
                                        <ErrorMessage msg={errors.name} className="text-[12px] sm:text-sm mt-1" />
                                    </div>
                                    <div>
                                        <FormInput 
                                            label={t.email}
                                            icon={<Mail className="w-5 h-5" />}
                                            type="email" 
                                            name="email"
                                            placeholder={t.emailPlaceholder} 
                                            value={formData.email}
                                            onChange={handleChange}
                                            isRTL={isRTL}
                                            className={`transition-all shadow-sm ${errors.email ? 'border-red-400 bg-red-50/10 focus:border-red-500 focus:ring-0' : 'border-gray-200/80 bg-gray-50/50 focus:border-secondary focus:ring-0 focus:bg-white'}`}
                                        />
                                        <ErrorMessage msg={errors.email} className="text-[12px] sm:text-sm mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <FormInput 
                                        label={t.subject}
                                        icon={<MessageSquare className="w-5 h-5" />}
                                        type="text" 
                                        name="subject"
                                        placeholder={t.subjectPlaceholder} 
                                        value={formData.subject}
                                        onChange={handleChange}
                                        isRTL={isRTL}
                                        className={`transition-all shadow-sm ${errors.subject ? 'border-red-400 bg-red-50/10 focus:border-red-500 focus:ring-0' : 'border-gray-200/80 bg-gray-50/50 focus:border-secondary focus:ring-0 focus:bg-white'}`}
                                    />
                                    <ErrorMessage msg={errors.subject} className="text-[12px] sm:text-sm mt-1" />
                                </div>
                                
                                <div>
                                    <FormTextArea
                                        id="message"
                                        name="message"
                                        label={t.message}
                                        placeholder={t.messagePlaceholder}
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        className={`resize-none bg-gray-50/50 focus:bg-white transition-all shadow-sm focus:ring-0 ${errors.message ? 'border-red-400 focus:border-red-500' : 'border-gray-200/80 focus:border-secondary'}`}
                                    />
                                    <ErrorMessage msg={errors.message} className="text-[12px] sm:text-sm mt-1" />
                                </div>
                                
                                <div className="pt-6">
                                    <SubmitButton 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 py-4 shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/40 transition-all text-base font-bold rounded-xl hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                                                <span>{t.send}</span>
                                            </>
                                        )}
                                    </SubmitButton>
                                </div>
                                
                                {isSubmitted && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 mt-6 rounded-xl bg-green-50 border border-green-200 text-green-800 font-bold text-sm text-center flex items-center justify-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <HeartHandshake className="w-4 h-4 text-green-600" />
                                        </div>
                                        {t.success}
                                    </motion.div>
                                )}
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Column: Creative Illustration Sub-Section */}
                    <div className="order-1 lg:order-2 hidden lg:flex items-center justify-center relative w-full h-125">
                        <div className="relative w-full max-w-md aspect-square">
                            {/* Decorative Background Orbs (Vivid & Dark Glassy Feel) */}
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1], y: [0, -15, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -left-4 w-48 h-48 bg-secondary rounded-full opacity-90 blur-2xl"
                            />
                            <motion.div 
                                animate={{ scale: [1, 1.15, 1], y: [0, 20, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 right-0 w-64 h-64 bg-primary-700 rounded-full opacity-90 blur-2xl"
                            />
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute top-1/4 right-10 w-32 h-32 bg-indigo-500 rounded-full opacity-80 blur-2xl"
                            />

                            {/* Floating decorative ring */}
                            <motion.div 
                                animate={{ rotate: 360, y: [0, -10, 0] }}
                                transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                                className="absolute -top-6 left-1/4 w-12 h-12 rounded-full border-[6px] border-primary-500 z-0 opacity-80 shadow-lg"
                            />
                            
                            {/* Main Dark Glassy Form Mockup */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-4 sm:inset-10 bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/20 flex flex-col overflow-hidden z-10 p-6 md:p-8"
                            >
                                {/* Inner grain/texture overlay to simulate real frosted glass */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                                <div className="w-full flex justify-center mb-8 relative z-20">
                                    <div className="w-16 h-1.5 bg-white/30 rounded-full shadow-inner"></div>
                                </div>
                                
                                {/* Glassy UI Mockup Inside */}
                                <div className="flex-1 flex flex-col gap-5 text-start w-full relative z-20">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 w-3/4 shadow-sm border border-white/10">
                                        <div className="h-2 bg-white/40 rounded w-full mb-2"></div>
                                        <div className="h-2 bg-white/30 rounded w-5/6"></div>
                                    </div>
                                    
                                    <div className="bg-secondary/75 backdrop-blur-md rounded-2xl rounded-tr-sm p-4 w-3/4 ml-auto shadow-sm border border-white/10">
                                        <div className="h-2 bg-white/60 rounded w-full mb-2"></div>
                                        <div className="h-2 bg-white/60 rounded w-4/6 ml-auto"></div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 w-2/3 shadow-sm border border-white/10">
                                        <div className="h-2 bg-white/40 rounded w-full"></div>
                                    </div>

                                    {/* Mock Submit Button */}
                                    <div className="mt-auto h-12 bg-secondary/75 backdrop-blur-md rounded-xl w-full flex items-center justify-center shadow-lg border border-white/20 hover:bg-white/20 transition-colors">
                                        <div className="h-2 w-1/4 bg-white/60 rounded"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Icons (Dark Glassy) */}
                            <motion.div 
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-12 -left-6 z-20 bg-slate-900/40 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl shadow-xl shadow-black/20 border border-white/20 text-white"
                            >
                                <Phone className="w-7 h-7 sm:w-8 sm:h-8" />
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute top-1/3 -right-8 z-20 bg-secondary/75 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl shadow-xl shadow-black/20 border border-white/20 text-white"
                            >
                                <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
                            </motion.div>

                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-20 left-0 z-20 bg-slate-900/40 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl shadow-xl shadow-black/20 border border-white/20 text-white"
                            >
                                <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>
            </div>
       
    );
};

export default Contact;
