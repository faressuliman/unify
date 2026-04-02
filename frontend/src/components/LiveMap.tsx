import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import { renderToString } from 'react-dom/server';

// Fix leafet default icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons using Lucide and Tailwind colors
const createCustomIcon = (type: 'safe' | 'alert' | 'danger', count: number) => {
    let iconColor = '';
    let bgColor = '';
    let IconComponent = Info;

    switch (type) {
        case 'safe':
            iconColor = 'text-green-600';
            bgColor = 'bg-green-100 border-green-500';
            IconComponent = ShieldCheck;
            break;
        case 'alert':
            iconColor = 'text-secondary';
            bgColor = 'bg-primary-300 border-secondary';
            IconComponent = Info;
            break;
        case 'danger':
            iconColor = 'text-red-600';
            bgColor = 'bg-red-100 border-red-500';
            IconComponent = AlertTriangle;
            break;
    }

    const htmlString = renderToString(
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-md ${bgColor}`}>
            <IconComponent className={`w-5 h-5 ${iconColor}`} />
            <div className="absolute -top-2 -right-2 bg-tertiary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white">
                {count}
            </div>
        </div>
    );

    return divIcon({
        className: 'custom-leaflet-icon',
        html: htmlString,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

const mapLocations = [
    { id: 1, pos: [31.2001, 29.9187] as [number, number], city: 'Alexandria', cases: 32, type: 'danger' as const },
    { id: 2, pos: [30.0444, 31.2357] as [number, number], city: 'Cairo', cases: 145, type: 'danger' as const },
    { id: 3, pos: [29.9822, 31.2823] as [number, number], city: 'Maadi', cases: 8, type: 'alert' as const },
    { id: 4, pos: [31.0409, 31.3785] as [number, number], city: 'Mansoura', cases: 15, type: 'alert' as const },
    { id: 5, pos: [27.1783, 31.1859] as [number, number], city: 'Asyut', cases: 3, type: 'safe' as const },
    { id: 6, pos: [29.3084, 30.8428] as [number, number], city: 'Fayoum', cases: 2, type: 'safe' as const },
];

export default function LiveMap() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const t = isRTL ? ar.liveMap : en.liveMap;
    
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
                    style={{ width: '100%', height: '100%' }}
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
                                <div className="font-sans flex flex-col gap-1 p-1 rtl:text-right" dir={isRTL ? 'rtl' : 'ltr'}>
                                    <h3 className="font-bold text-tertiary text-sm m-0">{loc.city}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <span className={`w-2 h-2 rounded-full ${
                                            loc.type === 'danger' ? 'bg-red-500' : 
                                            loc.type === 'alert' ? 'bg-secondary' : 'bg-green-500'
                                        }`}></span>
                                        <span className="font-medium">{loc.cases} {t.cases}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}