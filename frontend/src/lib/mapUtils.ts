export const CITY_COORDS: Record<string, [number, number]> = {
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

export const DEFAULT_FALLBACK = { lat: 30.0444, lng: 31.2357 };

export function processMarkers(
  markers: any[],
  opts?: { fallbackLat?: number; fallbackLng?: number; shift?: number },
): any[] {
  const fallbackLat = opts?.fallbackLat ?? DEFAULT_FALLBACK.lat;
  const fallbackLng = opts?.fallbackLng ?? DEFAULT_FALLBACK.lng;
  const shift = opts?.shift ?? 0.08;

  const seen = new Set<string>();
  return (markers || []).map((m) => {
    let lat = Number(m.lat);
    let lng = Number(m.lng);

    if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && m.city) {
      const coords = CITY_COORDS[m.city];
      if (coords) {
        [lat, lng] = coords;
      }
    }

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      lat = fallbackLat;
      lng = fallbackLng;
    }

    let key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    while (seen.has(key)) {
      lat += (Math.random() - 0.5) * shift;
      lng += (Math.random() - 0.5) * shift;
      key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    }
    seen.add(key);

    return { ...m, lat, lng, position: [lat, lng] };
  });
}
