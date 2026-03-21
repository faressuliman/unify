import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ScanFace, FileSearch } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { en } from "../data/english";
import { ar } from "../data/arabic";
import unifyLogo from '../assets/unify.png';

export default function FooterSection() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = isRTL ? ar.footer : en.footer;

  return (
    <section className="relative flex snap-start items-center justify-center bg-tertiary pt-8 pb-12 md:pt-8 md:pb-12 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'} style={{ isolation: "isolate", zIndex: 1 }}>
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating Background Icons */}
      <motion.div
        className="absolute left-10 top-20 text-white/5 rtl:right-10 rtl:left-auto"
        animate={{
          rotate: [0, 360],
          y: [0, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <ScanFace size={200} />
      </motion.div>
      <motion.div
        className="absolute right-10 bottom-20 text-secondary/5 rtl:left-10 rtl:right-auto"
        animate={{
          rotate: [360, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <FileSearch size={180} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12 pt-4 sm:pt-4 md:pt-6 pb-24 sm:pb-24 md:pb-24 border-b border-primary/20">
        <div className="grid gap-8 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3">
          {/* Column 1 - Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 sm:mb-3 md:mb-4 flex items-center gap-2">
              <img src={unifyLogo} alt="Unify" className="h-14 w-auto brightness-0 invert" />
              <h3 className="text-lg font-extrabold tracking-normal text-white">
                {isRTL ? 'يونيفاي' : 'Unify'}
              </h3>
            </div>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed text-start max-w-xs">
              {t.description}
            </p>
          </motion.div>

          {/* Column 2 - Links (Centered on desktop, left on mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sm:flex sm:justify-center"
          >
            <div>
              <h4 className="mb-3 sm:mb-3 md:mb-4 text-base sm:text-lg md:text-lg font-bold text-white text-start">{t.quickLinksTitle}</h4>
              <ul className="space-y-2 md:space-y-3 text-start">
                {t.quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-sm md:text-base text-slate-300 hover:text-primary transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Column 3 - Contact (Aligned to end on desktop, left on mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sm:flex sm:justify-end"
          >
            <div>
              <h4 className="mb-3 sm:mb-3 md:mb-4 text-base sm:text-lg md:text-lg font-bold text-white text-start">{t.contactTitle}</h4>
              <ul className="space-y-3 md:space-y-3">
                <li className="flex items-center gap-3 text-sm md:text-base text-slate-300">
                  <Phone className="h-5 w-5 shrink-0 text-primary rtl:-scale-x-100" />
                  <span dir="ltr" className="hover:text-white transition-colors cursor-pointer">{t.phone}</span>
                </li>
                <li className="flex items-center gap-3 text-sm md:text-base text-slate-300">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span className="break-all hover:text-white transition-colors cursor-pointer">{t.email}</span>
                </li>
                <li className="flex items-center gap-3 text-sm md:text-base text-slate-300">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <span>{t.location}</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer Section for Copyright and Emergency */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 lg:px-12 py-4 md:flex-row">
            <p className="text-xs md:text-sm text-slate-400 font-medium">
                {t.rights}
            </p>
            <div className="flex items-center gap-2 sm:gap-3 text-xs md:text-sm text-slate-300 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                <Phone className="h-4 w-4 shrink-0 text-red-400 animate-pulse" />
                <span className="font-bold text-red-400">{t.emergencyTitle}</span>
                <span className="font-bold text-white tracking-wider" dir="ltr">{t.emergencyNumber}</span>
            </div>
        </div>
      </div>
    </section>
  );
}