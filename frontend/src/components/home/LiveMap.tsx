import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLanguage } from "../../context/LanguageContext";
import { postApi, type BackendMapMarker } from "@/lib/api";
import MapPopup from "../map/MapPopup";
import { en } from "../../data/english";
import { ar } from "../../data/arabic";

// --- دالة إنشاء الماركر بدون أي Shadow خارجي ---
const createCustomIcon = (type: "missing" | "found") => {
  const isMissing = type === "missing";
  const color = isMissing ? "#ef4444" : "#22c55e";

  const htmlContent = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
      ${
        isMissing
          ? `
        <div style="
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.4;
          animation: map-pulse 2s ease-out infinite;
        "></div>
      `
          : ""
      }
      <div style="
        position: relative;
        z-index: 10;
        width: 28px;
        height: 28px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        /* ضل خفيف جداً وناعم غير ملحوظ */
        box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <div style="
          position: absolute;
          bottom: -3px;
          width: 6px;
          height: 6px;
          background-color: ${color};
          transform: rotate(45deg);
          border-right: 1.5px solid white;
          border-bottom: 1.5px solid white;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: htmlContent,
    className: "custom-marker-clean",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -15],
  });
};

const CITY_COORDS: Record<string, [number, number]> = {
  Cairo: [30.0444, 31.2357],
  القاهرة: [30.0444, 31.2357],
  Alexandria: [31.2001, 29.9187],
  الإسكندرية: [31.2001, 29.9187],
  Giza: [30.0131, 31.2089],
  الجيزة: [30.0131, 31.2089],
  Aswan: [24.0889, 32.8998],
  أسوان: [24.0889, 32.8998],
  Luxor: [25.6872, 32.6396],
  الأقصر: [25.6872, 32.6396],
  Asyut: [27.1783, 31.1859],
  أسيوط: [27.1783, 31.1859],
  Sohag: [26.557, 31.6948],
  سوهاج: [26.557, 31.6948],
  Ismailia: [30.5965, 32.2715],
  الإسماعيلية: [30.5965, 32.2715],
  "Port Said": [31.2565, 32.2841],
  بورسعيد: [31.2565, 32.2841],
  Suez: [29.9668, 32.5498],
  السويس: [29.9668, 32.5498],
  Mansoura: [31.0409, 31.3785],
  المنصورة: [31.0409, 31.3785],
  Tanta: [30.7865, 31.0004],
  طنطا: [30.7865, 31.0004],
  Zagazig: [30.5877, 31.5167],
  الزقازيق: [30.5877, 31.5167],
  Fayyum: [29.3084, 30.8428],
  الفيوم: [29.3084, 30.8428],
  Minya: [28.1099, 30.7503],
  المنيا: [28.1099, 30.7503],
};

export default function LiveMap() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const tMapPage = isRTL ? ar.mapPage : en.mapPage;
  const [markers, setMarkers] = useState<BackendMapMarker[]>([]);

  useEffect(() => {
    // جلب كل الحالات (الـ 102 حالة مفقودة)
    postApi
      .getMapMarkers({ status: "active", limit: 5000 })
      .then((res) => setMarkers(res.markers || []))
      .catch((err) => console.error("LiveMap markers fetch error:", err));
  }, []);

  const finalMarkers = useMemo(() => {
    const seen = new Set();
    return markers
      .map((m) => {
        let lat = Number(m.lat);
        let lng = Number(m.lng);
        if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && m.city) {
          const coords = CITY_COORDS[m.city];
          if (coords) [lat, lng] = coords;
        }
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

        let key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        let shift = 0.002;
        while (seen.has(key)) {
          lat += (Math.random() - 0.5) * shift;
          lng += (Math.random() - 0.5) * shift;
          key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        }
        seen.add(key);
        return { ...m, lat, lng };
      })
      .filter((m): m is any => m !== null);
  }, [markers]);

  return (
    <div className="w-full h-100 md:h-125 rounded-3xl overflow-hidden relative border border-slate-200 bg-slate-50">
      <style>{`
        /* 1. النبض */
        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }

        /* 2. مسح الظلال الافتراضية لأيقونات Leaflet (الحل الجذري) */
        .leaflet-marker-shadow, 
        .leaflet-shadow-pane,
        .leaflet-marker-icon { 
          display: none !important; 
          background: transparent !important; 
          border: none !important; 
          box-shadow: none !important; 
        }

        /* 3. إظهار الأيقونات المخصصة فقط */
        .custom-marker-clean {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: none !important;
          border: none !important;
        }

        .leaflet-container { z-index: 1 !important; font-family: inherit; }

        /* ستايل الـ Popup */
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <MapContainer
        center={[27.8206, 30.8025]}
        zoom={6}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {finalMarkers.map((loc: any) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={createCustomIcon(loc.type)}
          >
            <Popup closeButton={false} minWidth={280} className="custom-popup">
              <MapPopup
                post={{ ...loc, name: loc.name || (isRTL ? "حالة" : "Case") }}
                isRTL={isRTL}
                t={tMapPage}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* الـ Badge */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[12px] font-bold text-slate-700">
            {markers.filter((m) => m.type === "missing").length}{" "}
            {isRTL ? "مفقود" : "Missing"}
          </span>
        </div>
      </div>
    </div>
  );
}
