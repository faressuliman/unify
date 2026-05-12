import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { divIcon } from "leaflet";
import { ShieldCheck, AlertTriangle, Info } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { en } from "../../data/english";
import { ar } from "../../data/arabic";
import { renderToString } from "react-dom/server";
import { postApi } from "@/lib/api";

// Fix leafet default icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons using Lucide and Tailwind colors
const createCustomIcon = (type: "safe" | "alert" | "danger", count: number) => {
  let iconColor = "";
  let bgColor = "";
  let IconComponent = Info;

  switch (type) {
    case "safe":
      iconColor = "text-green-600";
      bgColor = "bg-green-100 border-green-500";
      IconComponent = ShieldCheck;
      break;
    case "alert":
      iconColor = "text-secondary";
      bgColor = "bg-primary-300 border-secondary";
      IconComponent = Info;
      break;
    case "danger":
      iconColor = "text-red-600";
      bgColor = "bg-red-100 border-red-500";
      IconComponent = AlertTriangle;
      break;
  }

  const htmlString = renderToString(
    <div
      className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-md ${bgColor}`}
    >
      <IconComponent className={`w-5 h-5 ${iconColor}`} />
      <div className="absolute -top-2 -right-2 bg-tertiary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white">
        {count}
      </div>
    </div>,
  );

  return divIcon({
    className: "custom-leaflet-icon",
    html: htmlString,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
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
  const t = isRTL ? ar.liveMap : en.liveMap;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await postApi.getPosts({
          status: "active",
          limit: 1000,
        });
        setMarkers(response.data || []);
      } catch (error) {
        console.error("Failed to load map markers", error);
      }
    };
    fetchMarkers();
  }, []);

  const mapLocations = useMemo(() => {
    if (markers.length === 0) return [];

    const groups: Record<
      string,
      {
        count: number;
        missing: number;
        found: number;
        lat: number;
        lng: number;
      }
    > = {};

    markers.forEach((m) => {
      const cityKey = m.city || "Unknown";

      if (!groups[cityKey]) {
        const coords = CITY_COORDS[cityKey] || [27.8206, 30.8025];
        groups[cityKey] = {
          count: 0,
          missing: 0,
          found: 0,
          lat: m.lat || m.latitude || coords[0],
          lng: m.lng || m.longitude || coords[1],
        };
      }
      groups[cityKey].count++;
      const type = m.type || m.postType;
      if (type === "missing") groups[cityKey].missing++;
      if (type === "found") groups[cityKey].found++;
    });

    return Object.entries(groups).map(([city, data], index) => {
      let type: "danger" | "alert" | "safe" = "safe";
      if (data.missing > 5) type = "danger";
      else if (data.missing > 0) type = "alert";
      else if (data.found > 0) type = "safe";

      return {
        id: index,
        pos: [data.lat, data.lng] as [number, number],
        city:
          city === "Unknown"
            ? isRTL
              ? "مواقع أخرى"
              : "Other Locations"
            : city,
        cases: data.count,
        missing: data.missing,
        found: data.found,
        type,
      };
    });
  }, [markers, isRTL]);

  return (
    <div className="w-full h-100 md:h-125 rounded-2xl overflow-hidden border-2 border-primary-dark shadow-sm relative z-0">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[27.8206, 30.8025]}
          zoom={6}
          scrollWheelZoom={false}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          style={{ width: "100%", height: "100%" }}
          className="w-full h-full z-10 custom-map-tiles"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {mapLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.pos}
              icon={createCustomIcon(loc.type, loc.cases)}
            >
              <Popup className="custom-popup">
                <div
                  className="font-sans flex flex-col gap-1 p-1 rtl:text-right"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <h3 className="font-bold text-tertiary text-sm m-0">
                    {loc.city}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        loc.type === "danger"
                          ? "bg-red-500"
                          : loc.type === "alert"
                            ? "bg-secondary"
                            : "bg-green-500"
                      }`}
                    ></span>
                    <span className="font-medium">
                      {loc.cases} {t.cases}
                    </span>
                  </div>
                  {(loc.missing > 0 || loc.found > 0) && (
                    <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-slate-100">
                      {loc.missing > 0 && (
                        <span className="text-[10px] font-semibold text-red-600">
                          {loc.missing} {isRTL ? "مفقود" : "Missing"}
                        </span>
                      )}
                      {loc.found > 0 && (
                        <span className="text-[10px] font-semibold text-green-600">
                          {loc.found} {isRTL ? "معثور عليه" : "Found"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
