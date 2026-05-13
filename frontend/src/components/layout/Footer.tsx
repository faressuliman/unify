import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, ScanFace, FileSearch } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { en } from "../../data/english";
import { ar } from "../../data/arabic";
import unifyLogo from "../../assets/unify.png";

export default function Footer() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const t = isRTL ? ar.footer : en.footer;
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const quickLinkPaths = [
    "/search",
    "/poster-builder",
    "#",
    "/contact",
    "/about-us",
  ];

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex snap-start items-center justify-center bg-primary-dark pt-4 pb-6 md:pt-4 md:pb-6 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ isolation: "isolate", zIndex: 1 }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        className="absolute left-10 top-20 text-tertiary/5 rtl:right-10 rtl:left-auto"
        animate={
          isInView
            ? {
                rotate: [0, 360],
                y: [0, -30, 0],
              }
            : { rotate: 0, y: 0 }
        }
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <ScanFace size={200} />
      </motion.div>
      <motion.div
        className="absolute right-10 bottom-20 text-tertiary/5 rtl:left-10 rtl:right-auto"
        animate={
          isInView
            ? {
                rotate: [360, 0],
                y: [0, 30, 0],
              }
            : { rotate: 360, y: 0 }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <FileSearch size={180} />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-350 px-4 lg:px-8 pt-2 pb-10 border-b border-tertiary/10">
        <div className="grid gap-8 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 sm:mb-3 md:mb-4 flex items-center gap-2">
              <img
                src={unifyLogo}
                alt="Unify"
                className="h-14 w-auto drop-shadow-sm brightness-0"
              />
              <h3 className="text-2xl font-extrabold tracking-normal text-tertiary">
                {t.brand}
              </h3>
            </div>
            <p className="text-sm md:text-base text-tertiary/80 leading-relaxed text-start max-w-xs">
              {t.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sm:flex sm:justify-center"
          >
            <div>
              <h4 className="mb-3 sm:mb-3 md:mb-4 text-base sm:text-lg md:text-lg font-bold text-tertiary text-start">
                {t.quickLinksTitle}
              </h4>
              <ul className="space-y-2 md:space-y-3 text-start">
                {t.quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={quickLinkPaths[idx]}
                      className="text-sm md:text-base text-tertiary hover:text-tertiary transition-colors duration-200 font-semibold"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.85 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sm:flex sm:justify-end"
          >
            <div>
              <h4 className="mb-3 sm:mb-3 md:mb-4 text-base sm:text-lg md:text-lg font-bold text-tertiary text-start">
                {t.contactTitle}
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-tertiary/5">
                    <Phone className="h-5 w-5 text-secondary border-none rtl:-scale-x-100" />
                  </div>
                  <span
                    dir="ltr"
                    className="text-sm md:text-base text-tertiary/80 transition-colors cursor-pointer font-medium hover:text-secondary"
                  >
                    {t.phone}
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-tertiary/5">
                    <Mail className="h-5 w-5 text-secondary border-none" />
                  </div>
                  <span className="break-all text-sm md:text-base text-tertiary/80 transition-colors cursor-pointer font-medium hover:text-secondary">
                    {t.email}
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-tertiary/5">
                    <MapPin className="h-5 w-5 text-secondary border-none" />
                  </div>
                  <span className="text-sm md:text-base text-tertiary/80 font-medium">
                    {t.location}
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 w-full bg-white/50 backdrop-blur-md border-t border-tertiary/5">
        <div className="mx-auto flex w-full max-w-350 flex-col items-center justify-between gap-4 px-6 lg:px-12 py-4 md:flex-row">
          <p className="text-xs md:text-sm text-tertiary/70 font-semibold">
            {t.rights}
          </p>
          <div className="group inline-flex items-center gap-1.5 text-xs md:text-sm text-tertiary bg-red-100 px-3 py-1 rounded-full border border-red-200 cursor-pointer transition-all duration-300 hover:bg-red-50 shadow-sm hover:shadow-md">
            <Phone className="h-3.5 w-3.5 shrink-0 text-red-600 animate-pulse" />
            <span className="font-semibold text-red-600 whitespace-nowrap">
              {t.emergencyTitle}
            </span>
            <div className="flex items-center md:grid md:grid-cols-[0fr] md:group-hover:grid-cols-[1fr] transition-[grid-template-columns] duration-300 ease-in-out">
              <div className="overflow-hidden flex flex-row items-center gap-1 whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                <span className="font-semibold text-red-600">:</span>
                <span
                  className="font-semibold text-tertiary tracking-wider"
                  dir="ltr"
                >
                  {t.emergencyNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
