"use client";

import { useEffect, useState } from "react";

interface Stats {
  active_aircraft: number;
  countries_active: number;
  total_profiles: number;
  vip_aircraft: number;
  peak_score_today: number;
  peak_region: string;
  last_update: string | null;
}

export default function RealTimeStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel rounded-xl p-4 animate-pulse h-24"></div>
        ))}
      </div>
    );
  }

  const isStale = stats.last_update
    ? new Date().getTime() - new Date(stats.last_update).getTime() > 5 * 60000
    : true;

  const statCards = [
    {
      label: "Active Assets",
      value: stats.active_aircraft,
      subtext: "TRACKING NOW",
      color: "text-tech-blue",
      glow: "shadow-tech-blue/20",
    },
    {
      label: "Nations Active",
      value: stats.countries_active,
      subtext: "GLOBAL REACH",
      color: "text-emerald-400",
      glow: "shadow-emerald-400/20",
    },
    {
      label: "24h Peak Risk",
      value: stats.peak_score_today,
      subtext: "/100 MAX",
      color: stats.peak_score_today >= 60 ? "text-panic-high" : "text-amber-400",
      glow: stats.peak_score_today >= 60 ? "shadow-panic-high/20" : "shadow-amber-400/20",
    },
    {
      label: "VIP Movement",
      value: stats.vip_aircraft,
      subtext: "HIGH VALUE TARGETS",
      color: "text-white",
      glow: "shadow-white/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="glass-panel rounded-xl p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${card.color}`}>
              <svg className="w-16 h-16 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
                {card.label}
              </div>
              <div className={`text-3xl md:text-4xl font-bold font-mono ${card.color} drop-shadow-lg`}>
                {card.value}
              </div>
              <div className="text-[10px] font-bold text-gray-500 mt-1 tracking-wider border-l-2 border-gray-700 pl-2">
                {card.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-app-surface/50 border border-white/5">
          <div className={`w-2 h-2 rounded-full ${isStale ? "bg-amber-500" : "bg-emerald-500"} ${!isStale && "animate-pulse"}`}></div>
          <span className="text-gray-400 uppercase">
            {isStale ? "CONNECTION UNSTABLE" : "SYSTEM ONLINE"}
          </span>
        </div>
        {stats.last_update && (
          <span className="text-gray-600">
            UPDATED: {new Date(stats.last_update).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
