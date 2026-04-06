import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowDownRight, 
  ArrowDownLeft, 
  UserPlus, 
  Search, 
  ClipboardCheck, 
  ShieldCheck, 
  MessageSquare, 
  Heart 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import HomeFeatureCard from './HomeFeatureCard';
import { en } from '../../data/english';
import { ar } from '../../data/arabic';

const icons = [UserPlus, Search, ClipboardCheck, ShieldCheck, MessageSquare, Heart];

export default function HowUnifyWorks() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const t = isRTL ? ar.howItWorks : en.howItWorks;
    
    const [featureSlideIndex, setFeatureSlideIndex] = useState(0);
    const [homeCardIndex, setHomeCardIndex] = useState(0);

    const homeFeatures = t.steps.map((step, idx) => ({
        ...step,
        icon: icons[idx]
    }));

    // Simple touch handling for mobile
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEndAction = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setHomeCardIndex(prev => isRTL 
                ? Math.max(prev - 1, 0)
                : Math.min(prev + 1, homeFeatures.length - 1)
            );
        }
        if (isRightSwipe) {
            setHomeCardIndex(prev => isRTL
                ? Math.min(prev + 1, homeFeatures.length - 1)
                : Math.max(prev - 1, 0)
            );
        }
    };

    return (
        <section className="w-full bg-slate-50 relative pt-12 pb-16 md:pb-20 max-w-400 mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.9 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-8 flex flex-col items-start gap-1"
                    >
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-tertiary tracking-widest rtl:tracking-normal uppercase">
                                {t.title}
                            </h2>
                            {language === 'en' ? (
                                <ArrowDownRight className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:translate-x-1 hover:translate-y-1" />
                            ) : (
                                <ArrowDownLeft className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0 transition-transform duration-300 hover:-translate-x-1 hover:translate-y-1" />
                            )}
                        </div>
                        <p className="text-gray-500 mt-1 text-sm">
                            {t.subtitle}
                        </p>
                    </motion.div>

                    <div className="relative">
                        <div className="hidden md:flex items-center justify-between mb-8 relative z-10">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setFeatureSlideIndex(0)}
                                    className={`rounded-full transition-all duration-300 ${featureSlideIndex === 0 ? "w-8 h-3 bg-secondary" : "w-3 h-3 bg-slate-300 hover:bg-slate-400"}`}
                                    aria-label="Go to slide 1"
                                />
                                <button
                                    onClick={() => setFeatureSlideIndex(1)}
                                    className={`rounded-full transition-all duration-300 ${featureSlideIndex === 1 ? "w-8 h-3 bg-secondary" : "w-3 h-3 bg-slate-300 hover:bg-slate-400"}`}
                                    aria-label="Go to slide 2"
                                />
                            </div>

                            <button
                                onClick={() => setFeatureSlideIndex((prev) => (prev === 0 ? 1 : 0))}
                                className="w-12 h-12 bg-secondary hover:bg-secondary/80 text-primary rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                aria-label="Toggle slide"
                            >
                                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Desktop Slider */}
                        <div className="hidden md:block overflow-hidden py-4 -my-4">
                            <motion.div
                                className="flex"
                                animate={{ x: featureSlideIndex === 0 ? "0%" : (isRTL ? "50%" : "-50%") }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                style={{ width: "200%" }}
                            >
                                <div className="grid grid-cols-3 gap-4 lg:gap-8 w-1/2 px-2">
                                    {homeFeatures.slice(0, 3).map((item, index) => (
                                        <HomeFeatureCard
                                            key={index}
                                            icon={item.icon}
                                            title={item.title}
                                            description={item.desc}
                                            animationDelay={index * 0.1}
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-4 lg:gap-8 w-1/2 px-2">
                                    {homeFeatures.slice(3, 6).map((item, index) => (
                                        <HomeFeatureCard
                                            key={index + 3}
                                            icon={item.icon}
                                            title={item.title}
                                            description={item.desc}
                                            animationDelay={index * 0.1}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Mobile Slider */}
                        <div
                            className="md:hidden relative overflow-hidden py-4 -my-4"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEndAction}
                        >
                            <div
                                dir="ltr"
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: isRTL
                                    ? `translateX(-${(homeFeatures.length - 1 - homeCardIndex) * 100}%)`
                                    : `translateX(-${homeCardIndex * 100}%)`
                                }}
                            >
                                {(isRTL ? [...homeFeatures].reverse() : homeFeatures).map((item, index) => (
                                    <HomeFeatureCard
                                        key={index}
                                        icon={item.icon}
                                        title={item.title}
                                        description={item.desc}
                                        isMobile={true}
                                        currentIndex={homeCardIndex}
                                        totalCards={6}
                                        onDotClick={(idx) => setHomeCardIndex(isRTL ? 5 - idx : idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
