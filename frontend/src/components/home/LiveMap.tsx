import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLanguage } from "../../context/LanguageContext";
import { postApi, type BackendMapMarker } from "@/lib/api";
import { processMarkers } from "@/lib/mapUtils";
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


export default function LiveMap() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const tMapPage = isRTL ? ar.mapPage : en.mapPage;
  const [markers, setMarkers] = useState<BackendMapMarker[]>([]);

  useEffect(() => {
    // جلب كل الحالات (الـ 102 حالة مفقودة)
    postApi
      .getMapMarkers({ limit: 5000 })
      .then((res) => setMarkers(res.markers || []))
      .catch((err) => console.error("LiveMap markers fetch error:", err));
  }, []);

  const finalMarkers = useMemo(() => processMarkers(markers || []), [markers]);

  // const [wheelZoomEnabled, setWheelZoomEnabled] = useState(false);

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
        .leaflet-shadow-pane { 
          display: none !important; 
        }

        .leaflet-marker-icon:not(.custom-marker-clean):not(.marker-cluster) {
          display: none !important;
        }

        /* 3. إظهار الأيقونات المخصصة فقط */
        .custom-marker-clean {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: none !important;
          border: none !important;
        }
        
        /* ستايل التجمعات (Clusters) */
        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-cluster-small { background-color: rgba(59, 130, 246, 0.3); }
        .marker-cluster-small div { background-color: rgba(59, 130, 246, 0.9); }
        .marker-cluster-medium { background-color: rgba(59, 130, 246, 0.3); }
        .marker-cluster-medium div { background-color: rgba(59, 130, 246, 0.9); }
        .marker-cluster-large { background-color: rgba(59, 130, 246, 0.3); }
        .marker-cluster-large div { background-color: rgba(59, 130, 246, 0.9); }

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
            eventHandlers={{
              mouseover: (e) => {
                const marker = e.target as any;
                if (marker._closeTimeout) clearTimeout(marker._closeTimeout);
                marker.openPopup();
              },
              mouseout: (e) => {
                const marker = e.target as any;
                if (marker._clicked) return;
                marker._closeTimeout = setTimeout(() => {
                  const popupNode = marker.getPopup()?.getElement();
                  if (popupNode && popupNode.matches(":hover")) {
                    popupNode.onmouseleave = () => {
                      if (!marker._clicked) marker.closePopup();
                    };
                    return;
                  }
                  marker.closePopup();
                }, 300);
              },
              click: (e) => {
                const marker = e.target as any;
                marker._clicked = true;
              },
              popupclose: (e) => {
                const marker = e.target as any;
                marker._clicked = false;
              },
            }}
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
      <div className="absolute bottom-4 left-4 z-1000 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[12px] font-bold text-slate-700">
            {markers.filter((m) => m.type === "missing").length}{" "}
            {isRTL ? "مفقود" : "Missing"}
          </span>
        </div>
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span className="text-[12px] font-bold text-slate-700">
            {markers.filter((m) => m.type === "found").length}{" "}
            {isRTL ? "تم العثور عليه" : "Found"}
          </span>
        </div>
      </div>
    </div>
  );
}
