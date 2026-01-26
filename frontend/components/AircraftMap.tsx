"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Aircraft {
  icao_hex: string;
  callsign: string;
  lat: number;
  lon: number;
  altitude: number;
  ground_speed: number;
  heading: number;
  owner_country: string;
  owner_org: string;
  aircraft_type: string;
  is_vip: boolean;
  vip_tier: number;
  last_update: string;
}

// Custom aircraft icon based on VIP status
const createAircraftIcon = (aircraft: Aircraft) => {
  const color = aircraft.is_vip && aircraft.vip_tier <= 2 ? "#EF4444" : "#0EA5E9";
  const glowColor = aircraft.is_vip && aircraft.vip_tier <= 2 ? "rgba(239, 68, 68, 0.5)" : "rgba(14, 165, 233, 0.5)";
  const size = aircraft.is_vip ? 16 : 10;
  
  // HTML for the icon with direction arrow if heading exists
  const rotation = aircraft.heading || 0;
  
  return L.divIcon({
    className: "aircraft-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      position: relative;
    ">
      <div style="
        width: 100%;
        height: 100%;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${glowColor}, 0 0 20px ${glowColor};
        z-index: 2;
        position: relative;
      "></div>
      ${aircraft.is_vip && aircraft.vip_tier <= 2 ? `<div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${size * 3}px;
        height: ${size * 3}px;
        border: 1px solid ${color};
        border-radius: 50%;
        opacity: 0.3;
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>` : ''}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function AircraftMap() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAircraft = async () => {
    try {
      const response = await fetch("/api/aircraft");
      if (response.ok) {
        const data = await response.json();
        setAircraft(data.aircraft || []);
      }
    } catch (error) {
      console.error("Failed to fetch aircraft:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
    const interval = setInterval(fetchAircraft, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      US: "🇺🇸", GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", IT: "🇮🇹", ES: "🇪🇸",
      NL: "🇳🇱", PL: "🇵🇱", TR: "🇹🇷", RU: "🇷🇺", CN: "🇨🇳", KR: "🇰🇷",
      CA: "🇨🇦", AU: "🇦🇺", IL: "🇮🇱", AE: "🇦🇪", QA: "🇶🇦", KW: "🇰🇼",
    };
    return flags[country] || "🏳️";
  };

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden border border-white/10">
      <MapContainer
        center={[30, 10]}
        zoom={2}
        minZoom={2}
        style={{ height: "100%", width: "100%", background: "#0B1121" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {aircraft.map((ac) => (
          <Marker
            key={ac.icao_hex}
            position={[ac.lat, ac.lon]}
            icon={createAircraftIcon(ac)}
          >
            <Popup className="glass-popup">
              <div className="text-sm min-w-[200px] p-1">
                <div className="font-bold mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCountryFlag(ac.owner_country)}</span>
                    <span className="font-mono text-base text-tech-blue">{ac.callsign || ac.icao_hex.toUpperCase()}</span>
                  </div>
                  {ac.is_vip && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      VIP TIER {ac.vip_tier}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-xs font-mono text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">TYPE</span>
                    <span className="text-right">{ac.aircraft_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">OPERATOR</span>
                    <span className="text-right max-w-[120px] truncate">{ac.owner_org}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ALTITUDE</span>
                    <span className="text-right text-emerald-400">{ac.altitude.toLocaleString()} FT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SPEED</span>
                    <span className="text-right">{ac.ground_speed} KTS</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-tech-blue border-t-transparent rounded-full animate-spin"></div>
            <div className="text-tech-blue font-mono tracking-widest text-sm animate-pulse">ESTABLISHING UPLINK...</div>
          </div>
        </div>
      )}

      {/* Map Overlay UI */}
      <div className="absolute bottom-6 left-6 z-[400] bg-app-surface/80 backdrop-blur-md p-4 rounded-lg border border-white/10 shadow-xl max-w-xs">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">Legend</div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="relative w-3 h-3">
              <div className="absolute w-full h-full rounded-full bg-red-500 animate-ping opacity-75"></div>
              <div className="relative w-full h-full rounded-full bg-red-500 border border-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            </div>
            <span className="text-gray-300">VIP TARGET (HEAD OF STATE)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-tech-blue border border-white shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
            <span className="text-gray-300">MILITARY / GOV ASSET</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-gray-500 flex justify-between">
          <span>ASSETS TRACKED:</span>
          <span className="text-tech-blue font-bold">{aircraft.length}</span>
        </div>
      </div>
    </div>
  );
}
