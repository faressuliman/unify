import { useMemo, useState, useEffect, type FormEvent } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ListFilter, Search, Info, X, MapPin, Calendar } from "lucide-react";
import { SheetClose } from "../components/ui/sheet";
import { useLanguage } from "../context/LanguageContext";
import { en } from "../data/english";
import { ar } from "../data/arabic";
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from "../data/cities";
import PageHeader from "../components/ui/PageHeader";
import FormInput from "../components/ui/FormInput";
import SelectMenu from "../components/ui/SelectMenu";
import LocalizedDateInput from "../components/ui/LocalizedDateInput";
import SegmentedControl from "../components/ui/SegmentedControl";
import SubmitButton from "../components/ui/SubmitButton";
import MapPopup from "../components/map/MapPopup";
import { postApi } from "../lib/api";

// إحداثيات المدن كبديل (Fallback)
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

const DEFAULT_CENTER: [number, number] = [27.8206, 30.8025];

// --- إنشاء الماركر المطور (النبض للأحمر فقط + بدون ظل أسود) ---
const createMarkerIcon = (type: "missing" | "found") => {
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
        box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
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

function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize({ pan: false });
    const timer = setTimeout(invalidate, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

type MapFilters = {
  keyword: string;
  city: string;
  dateMissing: string;
  postType: "all" | "missing" | "found";
};

export default function Map() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const t = (isRTL ? ar.mapPage : en.mapPage) as any;

  const [draftFilters, setDraftFilters] = useState<MapFilters>({
    keyword: "",
    city: "",
    dateMissing: "",
    postType: "all",
  });
  const [appliedFilters, setAppliedFilters] = useState<MapFilters>({
    keyword: "",
    city: "",
    dateMissing: "",
    postType: "all",
  });
  const [posts, setPosts] = useState<any[]>([]);

  const cityOptions = useMemo(
    () => [
      { value: "", label: t.allNeighborhoods },
      ...(isRTL ? EGYPTIAN_CITIES_AR : EGYPTIAN_CITIES).map((c) => ({
        value: c,
        label: c,
      })),
    ],
    [isRTL, t.allNeighborhoods],
  );

  const statusOptions = [
    { value: "all", label: isRTL ? "الكل" : "All" },
    { value: "missing", label: t.missing },
    { value: "found", label: t.found },
  ];

  const mapCenterStr =
    appliedFilters.city && CITY_COORDS[appliedFilters.city]
      ? CITY_COORDS[appliedFilters.city]
      : DEFAULT_CENTER;
  const mapZoom =
    appliedFilters.city && CITY_COORDS[appliedFilters.city] ? 10 : 6;

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await postApi.getMapMarkers({
          postType:
            appliedFilters.postType === "all"
              ? undefined
              : appliedFilters.postType,
          city: appliedFilters.city || undefined,
          dateMissing: appliedFilters.dateMissing || undefined,
          keyword: appliedFilters.keyword || undefined,
          limit: 10000,
        });

        const seen = new Set<string>();
        const processed = (response.markers || []).map((m: any) => {
          let lat = Number(m.lat);
          let lng = Number(m.lng);
          if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && m.city) {
            const coords = CITY_COORDS[m.city];
            if (coords) [lat, lng] = coords;
          }

          // Fallback to Cairo if still no coordinates found so we don't drop any cases
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            lat = 30.0444;
            lng = 31.2357;
          }

          let key = `${lat?.toFixed(4)},${lng?.toFixed(4)}`;
          while (seen.has(key)) {
            lat += (Math.random() - 0.5) * 0.08;
            lng += (Math.random() - 0.5) * 0.08;
            key = `${lat?.toFixed(4)},${lng?.toFixed(4)}`;
          }
          seen.add(key);
          return { ...m, lat, lng, position: [lat, lng] };
        });

        setPosts(processed);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMarkers();
  }, [appliedFilters, isRTL]);

  const missingCount = posts.filter((p) => p.type === "missing").length;
  const foundCount = posts.filter((p) => p.type === "found").length;

  const handleSubmitFilters = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedFilters(draftFilters);
  };

  const renderFiltersContent = (
    showCloseButton = false,
    enableScroll = true,
  ) => (
    <form
      onSubmit={handleSubmitFilters}
      className={`flex flex-col h-full bg-white dark:bg-slate-900 font-sans w-full ${enableScroll ? "overflow-y-auto" : "overflow-hidden"}`}
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <ListFilter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
              {t.filterCases}
            </h3>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              {t.refineMarkers}
            </p>
          </div>
        </div>
        {showCloseButton && (
          <SheetClose className="bg-slate-50 rounded-full w-9 h-9 flex items-center justify-center">
            <X className="w-4 h-4" />
          </SheetClose>
        )}
      </div>
      <div className="p-6 flex flex-col gap-6 flex-1 bg-slate-50/30 dark:bg-slate-950/50">
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <label className="text-[0.7rem] font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            {t.keyword}
          </label>
          <FormInput
            id="keyword"
            label={null}
            value={draftFilters.keyword}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, keyword: e.target.value }))
            }
            placeholder={t.searchName}
            isRTL={isRTL}
          />
        </div>
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <label className="text-[0.7rem] font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            {t.areaRegion}
          </label>
          <SelectMenu
            id="city"
            label={null}
            value={draftFilters.city}
            onChange={(v) => setDraftFilters((p) => ({ ...p, city: v }))}
            options={cityOptions}
            isRTL={isRTL}
          />
        </div>
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <label className="text-[0.7rem] font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            {t.dateMissing}
          </label>
          <LocalizedDateInput
            id="dateMissing"
            label={null}
            value={draftFilters.dateMissing}
            onChange={(v) => setDraftFilters((p) => ({ ...p, dateMissing: v }))}
            isRTL={isRTL}
            placeholder={isRTL ? t.datePlaceholderArabic : t.datePlaceholder}
          />
        </div>
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <label className="text-[0.7rem] font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            {t.showStatus}
          </label>
          <SegmentedControl
            value={draftFilters.postType}
            onChange={(v) =>
              setDraftFilters((p) => ({ ...p, postType: v as any }))
            }
            options={statusOptions}
            className="w-full bg-slate-50 p-1 rounded-xl"
          />
        </div>
      </div>
      <div className="p-6 border-t bg-white dark:bg-slate-900 sticky bottom-0 z-10 w-full">
        <SubmitButton
          type="submit"
          className="w-full h-14 font-bold bg-amber-600 hover:bg-amber-700 rounded-xl"
        >
          {t.applyFilters}
        </SubmitButton>
      </div>
    </form>
  );

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-8 pb-16 font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes map-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
        /* مسح الظلال والأنماط الافتراضية */
        .leaflet-marker-shadow, .leaflet-shadow-pane { 
          display: none !important; 
        }
        .leaflet-marker-icon:not(.custom-marker-clean):not(.marker-cluster) {
          display: none !important;
        }
        .custom-marker-clean { display: flex !important; align-items: center !important; justify-content: center !important; background: none !important; border: none !important; }
        
        /* Marker Cluster Styling */
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
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      `}</style>

      <PageHeader
        navigatedTo={isRTL ? "الخريطة" : "Map"}
        title={t.title}
        subtitle={t.subtitle}
        showArrow={true}
        className="mb-2 w-full max-w-400 mx-auto px-6 lg:px-12"
      />

      <div className="max-w-400 mx-auto w-full px-4 lg:px-8 mt-4 flex-1 flex flex-col lg:flex-row gap-6 relative">
        <aside className="hidden lg:block w-90 xl:w-100 shrink-0 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24 h-[calc(100vh-140px)]">
          {renderFiltersContent(false, true)}
        </aside>

        <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative h-[70vh] min-h-100 lg:h-[calc(100vh-140px)] flex flex-col z-0">
          <div className="absolute inset-0 z-0">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={6}
              zoomControl={false}
              scrollWheelZoom={true}
              style={{ width: "100%", height: "100%" }}
            >
              <MapUpdater center={mapCenterStr} zoom={mapZoom} />
              <MapResizeFix />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <ZoomControl position="topleft" />

              {posts.map((post) => (
                <Marker
                  key={post.id}
                  position={post.position}
                  icon={createMarkerIcon(post.type)}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup
                    className="custom-popup"
                    closeButton={false}
                    minWidth={280}
                  >
                    <MapPopup post={post} isRTL={isRTL} t={t} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Floating Stats - Glassmorphism Design */}
          <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
            <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[12px] font-bold text-slate-700">
                {missingCount} {t.missing}
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-[12px] font-bold text-slate-700">
                {foundCount} {t.found}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
