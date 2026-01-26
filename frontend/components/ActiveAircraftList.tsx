"use client";

import { useEffect, useState } from "react";

interface Aircraft {
  icao_hex: string;
  callsign: string;
  owner_country: string;
  owner_org: string;
  aircraft_type: string;
  is_vip: boolean;
  vip_tier: number;
  last_seen: string;
}

export default function ActiveAircraftList() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAircraft = async () => {
      try {
        const response = await fetch("/api/aircraft/active");
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

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center h-[300px] flex items-center justify-center">
        <div className="text-gray-500 font-mono text-xs animate-pulse">ACQUIRING TRANSPONDER SIGNALS...</div>
      </div>
    );
  }

  if (aircraft.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <div className="text-gray-500 font-mono text-xs">NO TARGETS IN RANGE</div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
      <table className="w-full text-left border-collapse">
        <thead className="bg-app-surface-highlight/50 sticky top-0 backdrop-blur-md z-10">
          <tr>
            <th className="px-4 py-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Target</th>
            <th className="px-4 py-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest hidden sm:table-cell">Type</th>
            <th className="px-4 py-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest hidden md:table-cell">Operator</th>
            <th className="px-4 py-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Class</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {aircraft.map((ac) => (
            <tr key={ac.icao_hex} className="hover:bg-white/5 transition-colors group">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all">{getCountryFlag(ac.owner_country)}</span>
                  <div>
                    <div className="font-mono font-bold text-gray-200 text-xs">
                      {ac.callsign || ac.icao_hex.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">
                      {ac.icao_hex.toUpperCase()}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell font-mono">
                {ac.aircraft_type}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                <div className="truncate max-w-[150px]" title={ac.owner_org}>
                  {ac.owner_org}
                </div>
              </td>
              <td className="px-4 py-3">
                {ac.is_vip ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    ac.vip_tier <= 2 
                      ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                      : "bg-white/10 text-white border-white/30"
                  }`}>
                    {ac.vip_tier <= 2 ? "VIP TIER 1" : "VIP"}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    GOV/MIL
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
