import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { divIcon } from "leaflet";
import { UserCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { renderToString } from "react-dom/server";
import { postApi, type BackendMapMarker } from "@/lib/api";

// Fix leafet default icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const createCustomIcon = (type: "missing" | "found", count: number) => {
  const isMissing = type === "missing";
  const iconColor = isMissing ? "text-red-50" : "text-green-50";
  const bgColor = isMissing
    ? "bg-red-500 border-red-600"
    : "bg-green-500 border-green-600";

  const htmlString = renderToString(
    <div
      className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-md ${bgColor}`}
    >
      <UserCircle className={`w-5 h-5 ${iconColor}`} />
      <div className="absolute -top-2 -right-2 bg-white text-xs font-bold text-slate-800 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-slate-200">
        {count}
      </div>
    </div>,
  );

  return divIcon({
    className: "custom-leaflet-icon",
    html: htmlString,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -15],
  });
};

type GroupedMapMarker = BackendMapMarker & {
  count: number;
  lat: number;
  lng: number;
};

const groupMarkers = (markers: BackendMapMarker[]): GroupedMapMarker[] => {
  const groups = new Map<string, GroupedMapMarker>();

  markers.forEach((marker) => {
    if (marker.lat == null || marker.lng == null) return;
    const key = `${marker.lat}_${marker.lng}_${marker.type}`;
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      if (!existing.name && marker.name) existing.name = marker.name;
      if (!existing.city && marker.city) existing.city = marker.city;
      if (!existing.address && marker.address)
        existing.address = marker.address;
      if (!existing.lastSeenDate && marker.lastSeenDate)
        existing.lastSeenDate = marker.lastSeenDate;
    } else {
      groups.set(key, {
        ...marker,
        count: 1,
        lat: marker.lat,
        lng: marker.lng,
      });
    }
  });

  return Array.from(groups.values());
};

export default function LiveMap() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [markers, setMarkers] = useState<BackendMapMarker[]>([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await postApi.getMapMarkers({
          status: "active",
          limit: 1000,
        });
        setMarkers(response.markers || []);
      } catch (error) {
        console.error("Failed to load map markers", error);
      }
    };
    fetchMarkers();
  }, []);

  const groupedMarkers = useMemo(() => groupMarkers(markers), [markers]);

  const missingCount = useMemo(
    () => markers.filter((marker) => marker.type === "missing").length,
    [markers],
  );
  const foundCount = useMemo(
    () => markers.filter((marker) => marker.type === "found").length,
    [markers],
  );

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

          {groupedMarkers.map((loc) => (
            <Marker
              key={`${loc.id}_${loc.type}_${loc.lat}_${loc.lng}`}
              position={[loc.lat, loc.lng]}
              icon={createCustomIcon(loc.type, loc.count)}
            >
              <Popup className="custom-popup">
                <div
                  className="font-sans flex flex-col gap-2 p-2 rtl:text-right"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <h3 className="font-bold text-tertiary text-sm m-0">
                    {loc.name || (isRTL ? "حالة" : "Case")}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {loc.city || loc.address || "-"}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {loc.type === "missing"
                      ? isRTL
                        ? "مفقود"
                        : "Missing"
                      : isRTL
                        ? "معثور عليه"
                        : "Found"}
                  </span>
                  {loc.count > 1 && (
                    <span className="text-[11px] text-slate-500">
                      {loc.count} {isRTL ? "حالات" : "cases"}
                    </span>
                  )}
                  {loc.lastSeenDate && (
                    <span className="text-[11px] text-slate-500">
                      {isRTL ? "تاريخ" : "Date:"}{" "}
                      {new Date(loc.lastSeenDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="absolute top-4 right-4 z-50 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200 text-slate-800">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
          <span className="text-sm font-semibold">
            {missingCount} {isRTL ? "مفقود" : "Missing"}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
          <span className="text-sm font-semibold">
            {foundCount} {isRTL ? "معثور عليه" : "Found"}
          </span>
        </div>
      </div>
    </div>
  );
}
