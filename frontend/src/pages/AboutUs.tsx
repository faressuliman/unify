import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, FileText, Share2, Users, Home, HeartHandshake, Map, ArrowRight, Globe, Clock, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [trustSlideIndex, setTrustSlideIndex] = useState(0);

    const t = {
        // Hero Section
        heroTitle: isRTL ? 'كل طفل يستحق أن يعود بأمان.' : 'Every Child Deserves to Be Found.',
        heroDesc: isRTL 
            ? 'نحن مجتمع متعاطف يقف إلى جانبك. معاً، نعيد الأمل للعائلات ونوفر شبكة أمان تساعد الأطفال المفقودين في إيجاد طريقهم إلى المنزل.'
            : 'We are a compassionate community standing by your side. Together, we bring hope back to families and provide a safety net to help missing children find their way home.',
        heroBtn: isRTL ? 'الإبلاغ عن حالة' : 'Report a Case',
        
        // Mission Section
        missionLabel: isRTL ? 'مهمتنا' : 'Our Mission',
        missionTitle: isRTL ? 'نربط القلوب، بخطوة واحدة في كل مرة.' : 'Reconnecting hearts, one step at a time.',
        missionDesc: isRTL 
            ? 'بنينا يوني-فاي لأننا نؤمن بأن لا توجد عائلة يجب أن تواجه كابوس فقدان طفل أو عزيز بمفردها. مهمتنا إنسانية بحتة: استخدام التكنولوجيا كجسر آمن يربط العائلات اليائسة بمجتمع يقظ ومهتم، لضمان رؤية كل طفل مفقود وحمايته.'
            : 'We built Unify because we believe that no family should face the nightmare of a missing child or loved one alone. Our mission is strictly human: to use technology as a secure bridge connecting desperate families with a vigilant, caring community, ensuring every lost child is seen and protected.',

        // How it works
        stepsLabel: isRTL ? 'كيف نعمل معاً' : 'How We Work Together',
        step1Title: isRTL ? '1. أنشئ بلاغاً' : '1. Report',
        step1Desc: isRTL ? 'أنشئ ملفاً آمناً فورياً يتضمن صورة وتفاصيل طفلك المفقود.' : 'Instantly create a secure profile with a photo and details of your missing child.',
        step2Title: isRTL ? '2. نمرر الرسالة' : '2. Share',
        step2Desc: isRTL ? 'نقوم بإنشاء ملصقات ذكية وننشر التنبيهات عبر مجتمعنا المحلي.' : 'We generate smart posters and broadcast alerts across our local community network.',
        step3Title: isRTL ? '3. لم الشمل' : '3. Reunite',
        step3Desc: isRTL ? 'توجيهات المجتمع والمطابقة الذكية تساعد في إعادة طفلك بأمان للمنزل.' : 'Community tips and smart matching safely guide your child back home.',

        // Why Trust Us
        trustLabel: isRTL ? 'لماذا تثق بنا' : 'Why Trust Us',
        trustCards: [
            {
                title: isRTL ? 'الخصوصية المطلقة' : 'Absolute Privacy',
                desc: isRTL ? 'نحن نحمي بيانات عائلتك الحساسة. تتم مشاركة التفاصيل الضرورية فقط للمساعدة في البحث.' : 'We safeguard your family\'s sensitive data. Only necessary details are shared to assist the search.',
                icon: <Shield className="w-6 h-6" />
            },
            {
                title: isRTL ? 'مجتمع داعم' : 'A Caring Community',
                desc: isRTL ? 'آلاف العيون اليقظة تبحث وتهتم. شبكة حقيقية من الأشخاص المستعدين للمساعدة.' : 'Thousands of vigilant eyes looking out for you. A genuine network of people ready to help.',
                icon: <Users className="w-6 h-6" />
            },
            {
                title: isRTL ? 'آمن وموثوق' : 'Safe & Reliable',
                desc: isRTL ? 'نعمل على معالجة المعلومات بعناية لتقليل التوتر وإبقاء التركيز على ما يهم: طفلك.' : 'We process information carefully to reduce stress and keep the focus on what matters: your child.',
                icon: <HeartHandshake className="w-6 h-6" />
            },
            {
                title: isRTL ? 'تغطية واسعة' : 'Wide Coverage',
                desc: isRTL ? 'إيصال الإشعار إلى آلاف المستخدمين في منطقتك خلال دقائق معدودة.' : 'Reaching thousands of users in your area within minutes with fast alerts.',
                icon: <Globe className="w-6 h-6" />
            },
            {
                title: isRTL ? 'دائماً متاحون' : 'Always Available',
                desc: isRTL ? 'المنصة ومجتمعنا متاحان على مدار الساعة، لأن كل ثانية تحدث فرقاً.' : 'Our platform and community are available around the clock, because every second counts.',
                icon: <Clock className="w-6 h-6" />
            },
            {
                title: isRTL ? 'مطابقة ذكية' : 'Smart Matching',
                desc: isRTL ? 'نستخدم تقنيات حديثة لربط البلاغات والمشاهدات بشكل أسرع وأكثر دقة.' : 'We use modern technology to connect reports and sightings faster and more accurately.',
                icon: <Zap className="w-6 h-6" />
            }
        ],

        // Emotional Section
        emotionalQuote: isRTL 
            ? '"أنت لست وحدك في هذا البحث. خذ نفساً عميقاً، استند علينا، ودع مجتمعنا يساعدك."'
            : '"You are not alone in this search. Take a deep breath, lean on us, and let our community help."',
        
        // CTA (Preserved styling from earlier request)
        ctaTitle: isRTL ? 'كن جزءاً من الحل' : 'Be Part of the Solution',
        ctaDesc: isRTL ? 'سواء كنت تبحث عن شخص مفقود أو وجدت شخصاً يحتاج للمساعدة، يمكنك إحداث فرق اليوم.' : 'Whether you are looking for a missing loved one or have found someone in need of help, you can make a difference today.',
        ctaBtn1: isRTL ? 'إنشاء بلاغ' : 'Create a Post',
        ctaBtn2: isRTL ? 'تصفح الخريطة' : 'Explore the Map'
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-20 font-sans text-slate-800" dir={isRTL ? 'rtl' : 'ltr'}>
            
            <div className="max-w-400 mx-auto px-6 lg:px-12 space-y-24 pt-8 md:pt-16">
                
                {/* 1. HERO SECTION */}
                <motion.div 
                    initial="hidden" animate="visible" variants={fadeInUp}
                    className="relative bg-gradient-to-br from-[#FFF8E7] to-[#FFFBF0] rounded-[2.5rem] p-10 md:p-20 border border-[#FBEAC1] overflow-hidden flex flex-col justify-center items-center text-center"
                >
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFD571] via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="w-16 h-16 bg-[#FBEAC1] text-[#D97706] rounded-full flex items-center justify-center mb-8 relative z-10 shadow-sm">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    
                    <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold text-[#1F2937] mb-6 max-w-4xl leading-tight tracking-tight">
                        {t.heroTitle}
                    </h1>
                    <p className="relative z-10 text-lg md:text-xl text-[#4B5563] mb-10 max-w-2xl leading-relaxed">
                        {t.heroDesc}
                    </p>
                    
                    <Link 
                        to="/create-post" 
                        className="relative z-10 inline-flex h-14 items-center justify-center px-10 text-[1.1rem] font-bold text-[#1F2937] bg-[#FCD34D] rounded-2xl hover:bg-[#FBBF24] transition-all shadow-md hover:shadow-lg focus:scale-95"
                    >
                        {t.heroBtn}
                    </Link>
                </motion.div>

                {/* 2. OUR MISSION */}
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h3 className="text-[#D97706] font-bold tracking-wider uppercase text-sm mb-4">{t.missionLabel}</h3>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-6">{t.missionTitle}</h2>
                    <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed">
                        {t.missionDesc}
                    </p>
                </motion.div>

                {/* 3. HOW IT WORKS */}
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1F2937]">{t.stepsLabel}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-[#FCE7F3] z-0 pointer-events-none"></div>

                        <div className="relative z-10 bg-white rounded-3xl p-8 border border-[#F3F4F6] shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#FFFBEB] rounded-2xl flex items-center justify-center text-[#D97706] mb-6 shadow-sm border border-[#FEF3C7]">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2937] mb-3">{t.step1Title}</h3>
                            <p className="text-[#6B7280] leading-relaxed text-sm md:text-base">{t.step1Desc}</p>
                        </div>

                        <div className="relative z-10 bg-white rounded-3xl p-8 border border-[#F3F4F6] shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#FFFBEB] rounded-2xl flex items-center justify-center text-[#D97706] mb-6 shadow-sm border border-[#FEF3C7]">
                                <Share2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2937] mb-3">{t.step2Title}</h3>
                            <p className="text-[#6B7280] leading-relaxed text-sm md:text-base">{t.step2Desc}</p>
                        </div>

                        <div className="relative z-10 bg-white rounded-3xl p-8 border border-[#F3F4F6] shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#FFFBEB] rounded-2xl flex items-center justify-center text-[#D97706] mb-6 shadow-sm border border-[#FEF3C7]">
                                <Home className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2937] mb-3">{t.step3Title}</h3>
                            <p className="text-[#6B7280] leading-relaxed text-sm md:text-base">{t.step3Desc}</p>
                        </div>
                    </div>
                </motion.div>

                {/* 4. WHY TRUST US (With exact slider behavior) */}
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                    className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-[#E5E7EB] shadow-sm overflow-hidden relative"
                >
                    <div className="mb-12 flex justify-center w-full relative z-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-slate-800 mb-8">{t.trustLabel}</h2>
                        </div>
                        {/* Slide controllers top left */}
                        <div className="absolute left-0 top-0 hidden md:flex items-center gap-1">
                            <button
                                onClick={() => setTrustSlideIndex(0)}
                                className={`rounded-full transition-all duration-300 ${trustSlideIndex === 0 ? "w-8 h-3 bg-secondary" : "w-3 h-3 bg-slate-300 hover:bg-slate-400"}`}
                                aria-label="Go to slide 1"
                            />
                            <button
                                onClick={() => setTrustSlideIndex(1)}
                                className={`rounded-full transition-all duration-300 ${trustSlideIndex === 1 ? "w-8 h-3 bg-secondary" : "w-3 h-3 bg-slate-300 hover:bg-slate-400"}`}
                                aria-label="Go to slide 2"
                            />
                        </div>
                        {/* Circle Arrow right side */}
                        <div className="absolute right-0 top-0 hidden md:flex items-center justify-end">
                            <button
                                onClick={() => setTrustSlideIndex((prev) => (prev === 0 ? 1 : 0))}
                                className="w-12 h-12 bg-secondary hover:bg-secondary/80 text-white rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                aria-label="Toggle slide"
                            >
                                <motion.div
                                    initial={false}
                                    animate={{ rotate: trustSlideIndex === 0 ? 0 : 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                                </motion.div>
                            </button>
                        </div>
                    </div>

                    {/* Mobile standard stacked grid, Desktop uses slider */}
                    <div className="md:hidden grid grid-cols-1 gap-10">
                        {t.trustCards.map((card, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center px-4">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{card.title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-sm">{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block w-full overflow-hidden relative">
                        <motion.div
                            className="flex items-start"
                            animate={{ x: trustSlideIndex === 0 ? "0%" : (isRTL ? "50%" : "-50%") }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            style={{ width: "200%" }} // 6 visible columns
                        >
                            {/* Slide 1 items */}
                            <div className="w-1/6 shrink-0 px-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {t.trustCards[0].icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t.trustCards[0].title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-balance">{t.trustCards[0].desc}</p>
                            </div>
                            
                            <div className="w-1/6 shrink-0 px-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {t.trustCards[1].icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t.trustCards[1].title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-balance">{t.trustCards[1].desc}</p>
                            </div>

                            <div className="w-1/6 shrink-0 px-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {t.trustCards[2].icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t.trustCards[2].title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-balance">{t.trustCards[2].desc}</p>
                            </div>
                            
                            <div className="w-1/6 shrink-0 px-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {t.trustCards[3].icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t.trustCards[3].title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-balance">{t.trustCards[3].desc}</p>
                            </div>

                            <div className="w-1/6 shrink-0 px-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {t.trustCards[4].icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t.trustCards[4].title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-balance">{t.trustCards[4].desc}</p>
                            </div>

                            <div className="w-1/6 shrink-0 px-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center text-[#4B5563] mb-4">
                                    {t.trustCards[5].icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1F2937] mb-2">{t.trustCards[5].title}</h3>
                                <p className="text-[#6B7280] leading-relaxed text-balance">{t.trustCards[5].desc}</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* 5. EMOTIONAL SECTION */}
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                    className="flex justify-center"
                >
                    <div className="max-w-3xl text-center">
                        <p className="text-2xl md:text-3xl text-[#92400E] font-medium leading-relaxed italic opacity-90">
                            {t.emotionalQuote}
                        </p>
                    </div>
                </motion.div>

                {/* 6. CALL TO ACTION (Preserved styling exactly) */}
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
                    className="rounded-[3rem] bg-gradient-to-r from-[#eaddbd] to-[#fbf5e0] p-12 lg:p-20 text-center flex flex-col items-center relative overflow-hidden"
                >
                    <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] mb-6 tracking-tight">{t.ctaTitle}</h2>
                    <p className="text-[#334155] font-medium text-base lg:text-lg mb-10 max-w-2xl">
                        {t.ctaDesc}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        <Link 
                            to="/create-post" 
                            className="w-full sm:w-auto inline-flex h-14 items-center justify-center px-8 gap-2 text-[1rem] font-bold text-white bg-[#0f172a] rounded-2xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                        >
                            <FileText className="w-[18px] h-[18px]" />
                            {t.ctaBtn1}
                        </Link>
                        <Link 
                            to="/map" 
                            className="w-full sm:w-auto inline-flex h-14 items-center justify-center px-8 gap-2 text-[1rem] font-bold text-[#0f172a] bg-white border border-transparent rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <Map className="w-[18px] h-[18px]" />
                            {t.ctaBtn2} <span className={isRTL ? "rotate-180" : ""}>→</span>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default AboutUs;
