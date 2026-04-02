import { useMemo, useState, useEffect, type FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { divIcon } from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { renderToString } from 'react-dom/server';
import { ListFilter, Search, Info, X, UserCircle } from 'lucide-react';
import { SheetClose } from '../components/ui/sheet';
import { useLanguage } from '../components/LanguageContext';
import { en } from '../data/english';
import { ar } from '../data/arabic';
import { mockPosts, type MissingPerson } from '../data/mockData';
import { EGYPTIAN_CITIES, EGYPTIAN_CITIES_AR } from '../data/cities';
import MapDrawer from '../components/MapDrawer';
import PageHeader from '../components/ui/PageHeader';
import FormInput from '../components/ui/FormInput';
import SelectMenu from '../components/ui/SelectMenu';
import LocalizedDateInput from '../components/ui/LocalizedDateInput';
import SegmentedControl from '../components/ui/SegmentedControl';
import SubmitButton from '../components/ui/SubmitButton';
import MapPopup from '../components/MapPopup';

L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });

const CITY_COORDS: Record<string, [number, number]> = {
  'Cairo': [30.0444, 31.2357], 'ط§ظ„ظ‚ط§ظ‡ط±ط©': [30.0444, 31.2357],
  'Alexandria': [31.2001, 29.9187], 'ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©': [31.2001, 29.9187],
  'Giza': [30.0131, 31.2089], 'ط§ظ„ط¬ظٹط²ط©': [30.0131, 31.2089],
  'Aswan': [24.0889, 32.8998], 'ط£ط³ظˆط§ظ†': [24.0889, 32.8998],
  'Luxor': [25.6872, 32.6396], 'ط§ظ„ط£ظ‚طµط±': [25.6872, 32.6396],
  'Asyut': [27.1783, 31.1859], 'ط£ط³ظٹظˆط·': [27.1783, 31.1859],
  'Sohag': [26.5570, 31.6948], 'ط³ظˆظ‡ط§ط¬': [26.5570, 31.6948],
  'Ismailia': [30.5965, 32.2715], 'ط§ظ„ط¥ط³ظ…ط§ط¹ظٹظ„ظٹط©': [30.5965, 32.2715],
  'Port Said': [31.2565, 32.2841], 'ط¨ظˆط±ط³ط¹ظٹط¯': [31.2565, 32.2841],
  'Suez': [29.9668, 32.5498], 'ط§ظ„ط³ظˆظٹط³': [29.9668, 32.5498],
  'Mansoura': [31.0409, 31.3785], 'ط§ظ„ظ…ظ†طµظˆط±ط©': [31.0409, 31.3785],
  'Tanta': [30.7865, 31.0004], 'ط·ظ†ط·ط§': [30.7865, 31.0004],
  'Zagazig': [30.5877, 31.5167], 'ط§ظ„ط²ظ‚ط§ط²ظٹظ‚': [30.5877, 31.5167],
  'Fayyum': [29.3084, 30.8428], 'ط§ظ„ظپظٹظˆظ…': [29.3084, 30.8428],
  'Minya': [28.1099, 30.7503], 'ط§ظ„ظ…ظ†ظٹط§': [28.1099, 30.7503]
};

const DEFAULT_CENTER: [number, number] = [27.8206, 30.8025]; // Central Egypt

// Generates persistent pseudo-random coords for mock posts so they don't jump around
const getMockPosition = (post: MissingPerson): [number, number] => {
  const hash = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (post.city && CITY_COORDS[post.city]) {
    // Add small random offset around city
    const offsetLat = ((hash % 10) - 5) * 0.01;
    const offsetLng = (((hash * 3) % 10) - 5) * 0.01;
    return [CITY_COORDS[post.city][0] + offsetLat, CITY_COORDS[post.city][1] + offsetLng];
  }
  
  const lat = 24.0 + ((hash % 100) / 100) * 7.5; // Bounds within populated Egypt roughly
  const lng = 29.0 + (((hash * 13) % 100) / 100) * 4.0;
  return [lat, lng];
};

const createMarkerIcon = (type: 'missing' | 'found') => {
  const isMissing = type === 'missing';
  
  const htmlString = renderToString(
    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-md ${isMissing ? 'bg-red-500 border-white text-white' : 'bg-green-500 border-white text-white'}`}>
      <UserCircle className="w-4 h-4 text-white" />
    </div>
  );

  return divIcon({
    className: 'custom-map-icon',
    html: htmlString,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
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

    const scheduleInvalidate = () => {
      requestAnimationFrame(invalidate);
      setTimeout(invalidate, 120);
      setTimeout(invalidate, 420);
    };

    const timer = setTimeout(scheduleInvalidate, 60);
    const raf = requestAnimationFrame(scheduleInvalidate);

    const onResize = () => scheduleInvalidate();
    const onOrientationChange = () => setTimeout(scheduleInvalidate, 140);
    const onVisibility = () => {
      if (!document.hidden) scheduleInvalidate();
    };

    const mapElement = map.getContainer();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => scheduleInvalidate())
        : null;

    if (resizeObserver) {
      resizeObserver.observe(mapElement);
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientationChange);
    document.addEventListener('visibilitychange', onVisibility);

    map.whenReady(() => scheduleInvalidate());

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [map]);

  return null;
}

type MapFilters = {
  keyword: string;
  city: string;
  dateMissing: string;
  status: 'missing' | 'found';
};

export default function Map() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = isRTL ? ar.mapPage : (en as any).mapPage;

  const [draftFilters, setDraftFilters] = useState<MapFilters>({
    keyword: '',
    city: '',
    dateMissing: '',
    status: 'missing',
  });
  const [appliedFilters, setAppliedFilters] = useState<MapFilters>({
    keyword: '',
    city: '',
    dateMissing: '',
    status: 'missing',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const cityOptions = useMemo(
    () => [{ value: '', label: t.allNeighborhoods }, ...(isRTL ? EGYPTIAN_CITIES_AR : EGYPTIAN_CITIES).map(c => ({ value: c, label: c }))],
    [isRTL, t.allNeighborhoods]
  );

  const statusOptions = [
    { value: 'missing', label: t.missing },
    { value: 'found', label: t.found }
  ];

  const mapCenterStr = appliedFilters.city && CITY_COORDS[appliedFilters.city] ? CITY_COORDS[appliedFilters.city] : DEFAULT_CENTER;
  const mapZoom = appliedFilters.city && CITY_COORDS[appliedFilters.city] ? 10 : 6;

  const filteredPosts = useMemo(() => {
    return mockPosts.filter(post => {
      if (post.type !== appliedFilters.status) return false;
      if (appliedFilters.city && post.city !== appliedFilters.city && !post.location.includes(appliedFilters.city)) return false;
      if (appliedFilters.keyword) {
        const kw = appliedFilters.keyword.toLowerCase();
        if (!post.name.toLowerCase().includes(kw) && !post.id.toLowerCase().includes(kw)) return false;
      }
      if (appliedFilters.dateMissing) {
        const postDate = (post as MissingPerson & { dateMissing?: string }).dateMissing;
        if (postDate && postDate !== appliedFilters.dateMissing) return false;
      }
      return true;
    }).map(post => ({ ...post, position: getMockPosition(post) }));
  }, [appliedFilters]);

  const missingCount = filteredPosts.filter(p => p.type === 'missing').length;
  const foundCount = filteredPosts.filter(p => p.type === 'found').length;

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const handleClearField = (field: keyof MapFilters) => {
    setDraftFilters(prev => ({ ...prev, [field]: '' }));
    setAppliedFilters(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmitFilters = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleApplyFilters();
  };

  const renderClearFieldButton = (field: keyof MapFilters) => {
    if (!draftFilters[field] || field === 'status') return null;
    
    return (
      <button
        type="button"
        onClick={() => handleClearField(field)}
        className="text-xs font-semibold text-secondary hover:text-secondary/80 cursor-pointer normal-case tracking-normal"
      >
        {isRTL ? 'مسح' : 'Clear'}
      </button>
    );
  };

  const renderFiltersContent = (showCloseButton = false) => (
    <form onSubmit={handleSubmitFilters} className="flex flex-col h-full bg-white font-sans">
      <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <ListFilter className="w-5 h-5 text-secondary mt-0.5" />
          <div className="space-y-1 text-start">
            <h3 className="font-bold text-lg text-tertiary leading-tight">{t.filterCases}</h3>
            <p className="text-sm font-semibold text-slate-500">{t.refineMarkers}</p>
          </div>
        </div>
        {showCloseButton && (
          <SheetClose className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer">
            <X className="w-4 h-4"/>
          </SheetClose>
        )}
      </div>
      <div className="p-5 flex flex-col gap-6 flex-1">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-xs font-bold text-gray-500 uppercase block text-start ${isRTL ? 'tracking-normal' : 'tracking-widest'}`}>{t.keyword}</label>
            {renderClearFieldButton('keyword')}
          </div>
          <FormInput
            id="keyword"
            label={null}
            value={draftFilters.keyword}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            placeholder={t.searchName}
            icon={<Search className="w-4 h-4" />}
            isRTL={isRTL}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-xs font-bold text-gray-500 uppercase block text-start ${isRTL ? 'tracking-normal' : 'tracking-widest'}`}>{t.areaRegion}</label>
            {renderClearFieldButton('city')}
          </div>
          <SelectMenu
            id="city"
            label={null}
            value={draftFilters.city}
            onChange={(value) => setDraftFilters((prev) => ({ ...prev, city: value }))}
            options={cityOptions}
            isRTL={isRTL}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-xs font-bold text-gray-500 uppercase block text-start ${isRTL ? 'tracking-normal' : 'tracking-widest'}`}>{t.dateMissing}</label>
            {renderClearFieldButton('dateMissing')}
          </div>
          <LocalizedDateInput
            id="dateMissing"
            label={null}
            value={draftFilters.dateMissing}
            onChange={(value) => setDraftFilters((prev) => ({ ...prev, dateMissing: value }))}
            isRTL={isRTL}
            placeholder={isRTL ? 'يوم / شهر / عام' : 'MM / DD / YYYY'}
          />
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className={`text-xs font-bold text-gray-500 uppercase block mb-2 mt-2 text-start ${isRTL ? 'tracking-normal' : 'tracking-widest'}`}>{t.showStatus}</label>
          <SegmentedControl
            value={draftFilters.status}
            onChange={(value) => setDraftFilters((prev) => ({ ...prev, status: value as MapFilters['status'] }))}
            options={statusOptions}
            className="w-full"
          />
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-3">
          <SubmitButton type="submit" className="h-12 text-base shadow-none text-tertiary">
            {t.applyFilters}
          </SubmitButton>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-16 font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader 
        navigatedTo={isRTL ? 'الخريطة' : 'Map'}
        title={t.title} 
        subtitle={t.subtitle} 
        showArrow={true}
      />
      
      <div className="max-w-400 mx-auto w-full px-4 lg:px-8 mt-4 flex-1 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <MapDrawer
            isOpen={isFilterOpen}
            setIsOpen={setIsFilterOpen}
            isRTL={isRTL}
            triggerLabel={t.filterCases}
            content={renderFiltersContent(true)}
          />

          <span className="font-bold text-tertiary flex items-center gap-2">
            <Info className="w-5 h-5 text-secondary"/>
            {filteredPosts.length} {t.cases}
          </span>
        </div>

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-[320px] xl:w-87.5 shrink-0 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-24 h-[calc(100vh-140px)]">
          {renderFiltersContent(false)}
        </aside>

        {/* Main Map View */}
        <main className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative h-[70vh] min-h-100 lg:min-h-125 lg:h-[calc(100vh-140px)] flex flex-col z-0">
          
          <div className="absolute inset-0 z-0">
            <MapContainer 
              center={DEFAULT_CENTER} 
              zoom={6} 
              zoomControl={false} 
              dragging={true}
              touchZoom={true}
              doubleClickZoom={true}
              style={{ width: '100%', height: '100%' }}
              className="w-full h-full z-10 custom-map-tiles"
            >
              <MapUpdater center={mapCenterStr} zoom={mapZoom} />
              <MapResizeFix />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <ZoomControl position="topleft" />
              
              {filteredPosts.map(post => (
                <Marker 
                  key={post.id} 
                  position={post.position} 
                  icon={createMarkerIcon(post.type)}
                >
                  <Popup className="custom-popup" closeButton={false} minWidth={240}>
                    <MapPopup post={post} isRTL={isRTL} t={t} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Floating Stats Overlay Top Right */}
          <div className="absolute top-4 right-4 z-50 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-4 cursor-default">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                <span className="font-bold text-xs sm:text-sm text-slate-700"><span className="text-red-600 font-black">{missingCount}</span> {t.missing}</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
                <span className="font-bold text-xs sm:text-sm text-slate-700"><span className="text-green-600 font-black">{foundCount}</span> {t.found}</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}