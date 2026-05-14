import { Suspense, lazy, useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { en } from "../../data/english";
import { ar } from "../../data/arabic";
import { MapPin, ArrowDownRight, ArrowDownLeft } from "lucide-react";
import { motion } from "framer-motion";

const LiveMap = lazy(() => import("./LiveMap"));

export default function MapSection() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const t = isRTL ? ar.liveMap : en.liveMap;

  // إحصائيات حية مرتبطة بالـ Database
  const [stats, setStats] = useState({ missing: 0, found: 0 });

  useEffect(() => {
    // نداء للـ API العام (بدون توكن) لجلب الأرقام
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${apiUrl}/cases/public-stats`)
      .then((res) => res.json())
      .then((data) =>
        setStats({
          missing: data.activeMissing || 0,
          found: data.foundCases || 0,
        }),
      )
      .catch((err) => console.error("Stats fetch error:", err));
  }, []);

  return (
    <section
      className="w-full bg-slate-50 relative pt-4 pb-16 md:pb-20 max-w-350 mx-auto"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 flex flex-col items-center text-center gap-1"
        >
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-tertiary tracking-widest rtl:tracking-normal uppercase">
              {t.title}
            </h2>
            {language === "en" ? (
              <ArrowDownRight className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0" />
            ) : (
              <ArrowDownLeft className="h-6 w-6 sm:h-8 sm:w-8 text-secondary shrink-0" />
            )}
          </div>
          <p className="text-gray-500 mt-1 text-sm">{t.subtitle}</p>
        </motion.div>

        {/* شريط الأرقام الحقيقية */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-white border border-red-100 px-5 py-2 rounded-2xl shadow-sm flex items-center gap-3">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-800">
              {stats.missing} {isRTL ? "مفقود" : "Missing"}
            </span>
          </div>
          <div className="bg-white border border-green-100 px-5 py-2 rounded-2xl shadow-sm flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-bold text-slate-800">
              {stats.found} {isRTL ? "تم إيجادهم" : "Found"}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.85 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full relative shadow-xl rounded-3xl bg-white border border-slate-200 overflow-hidden"
        >
          <Suspense
            fallback={
              <div className="w-full h-125 flex flex-col items-center justify-center bg-slate-50 gap-4">
                <MapPin className="w-10 h-10 animate-pulse text-secondary" />
                <p className="font-bold text-sm uppercase text-slate-400">
                  {t.loading}
                </p>
              </div>
            }
          >
            <LiveMap />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}
