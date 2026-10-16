import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, ExternalLink, Phone, Clock, Compass } from 'lucide-react';

interface GoogleMapSectionProps {
  className?: string;
  showTitle?: boolean;
}

const OFFICE_COORDINATES = {
  lat: 6.4773,
  lng: 3.1857,
};

const OFFICE_ADDRESS = "DOYIN PLAZA, IGBOELERIN BUSSTOP, BESIDE PRIME-MART, OKOMAIKO, LAGOS";
const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("DOYIN PLAZA, IGBOELERIN BUS STOP, BESIDE PRIME-MART, OKOMAIKO, LAGOS")}`;

export const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({
  className = '',
  showTitle = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAxsRgvoRh5DEKDox56RlWAkg-c8NfxN_Q";

    const initMap = async () => {
      try {
        setOptions({
          key: apiKey,
          v: 'weekly',
        });

        const { Map, InfoWindow } = (await importLibrary('maps')) as any;

        if (!isMounted || !mapRef.current) return;

        const map = new Map(mapRef.current, {
          center: OFFICE_COORDINATES,
          zoom: 16,
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        });

        // Use standard Google Maps Marker without requiring mapId
        const marker = new (window as any).google.maps.Marker({
          map,
          position: OFFICE_COORDINATES,
          title: 'D Ensured Consult - Doyin Plaza, Igboelerin Bus Stop',
          animation: (window as any).google?.maps?.Animation?.DROP,
        });

        // Create InfoWindow
        const infoWindowContent = document.createElement('div');
        infoWindowContent.className = 'p-2 text-[#0a192f] space-y-1 font-sans';
        infoWindowContent.innerHTML = `
          <div style="font-weight: 900; font-size: 14px; color: #0a192f;">D Ensured Consult</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px; max-width: 220px; line-height: 1.4;">
            DOYIN PLAZA, IGBOELERIN BUSSTOP<br/>
            BESIDE PRIME-MART, OKOMAIKO, LAGOS
          </div>
          <div style="margin-top: 8px; font-size: 11px; font-weight: bold; color: #d97706;">
            Tel: 08147896930
          </div>
          <a 
            href="${GOOGLE_MAPS_DIRECTIONS_URL}" 
            target="_blank" 
            rel="noreferrer" 
            style="display: inline-block; margin-top: 8px; background: #0a192f; color: #f59e0b; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;"
          >
            Get Directions ↗
          </a>
        `;

        const infoWindow = new InfoWindow({
          content: infoWindowContent,
        });

        marker.addListener('click', () => {
          infoWindow.open({
            anchor: marker,
            map,
          });
        });

        // Open by default on initial view
        infoWindow.open({
          anchor: marker,
          map,
        });

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (err) {
        console.warn('Google Maps JS API load failed, falling back to direct navigation UI:', err);
        if (isMounted) {
          setMapError('Interactive map loading initialized fallback.');
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md ${className}`}>
      {showTitle && (
        <div className="p-6 sm:p-8 bg-[#0a192f] text-white border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] uppercase tracking-wider border border-[#f59e0b]/30">
              <Compass className="w-3.5 h-3.5" />
              Interactive Location Map
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Locate Our Office in Okomaiko, Lagos
            </h3>
            <p className="text-xs text-slate-300">
              Easily navigate to our tutorial and admission center with live Google Maps directions.
            </p>
          </div>

          <a
            href={GOOGLE_MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps / Get Directions</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80" />
          </a>
        </div>
      )}

      {/* Map Container Area */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100">
        <div ref={mapRef} className="w-full h-full" />

        {/* Fallback Iframe / Overlay if JS API is blocked or loading */}
        {mapError && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <iframe
              title="Google Map Office Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${OFFICE_COORDINATES.lat},${OFFICE_COORDINATES.lng}&hl=en&z=15&output=embed`}
            />
          </div>
        )}

        {/* Floating Quick Action Badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200 max-w-xs pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#d97706] text-white shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#0a192f]">D Ensured Consult</p>
              <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                DOYIN PLAZA, IGBOELERIN BUSSTOP<br />
                BESIDE PRIME-MART, OKOMAIKO, LAGOS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Landmark Directions & Info Bar */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <p className="font-bold text-[#0a192f] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Office Address</span>
          </p>
          <p className="text-slate-600 font-medium pl-5 leading-relaxed">
            {OFFICE_ADDRESS}
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-[#0a192f] flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Phone & WhatsApp</span>
          </p>
          <p className="text-slate-600 font-mono font-bold pl-5">
            <a href="tel:08147896930" className="hover:text-[#d97706]">08147896930</a>
          </p>
          <p className="text-[11px] text-slate-500 pl-5">
            WhatsApp: <a href="https://wa.me/2348147896930?text=Hello%20D%20Ensured%20Consult,%20I%20need%20directions%20to%20your%20office%20at%20Doyin%20Plaza." target="_blank" rel="noreferrer" className="text-[#d97706] font-bold hover:underline">08147896930</a>
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-[#0a192f] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Center Working Hours</span>
          </p>
          <p className="text-slate-600 font-medium pl-5">
            Mon – Fri: 8:00 AM – 6:00 PM<br />
            Saturday: 8:00 AM – 4:00 PM
          </p>
        </div>
      </div>
    </div>
  );
};
