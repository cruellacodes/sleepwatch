"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  region: string;
  score: number;
  narrative: string;
  flight_count: number;
  countries_involved: number;
  timestamp: string;
  type: "extreme" | "high" | "elevated";
}

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (type: string) => {
    switch (type) {
      case "extreme": return "text-panic-extreme border-panic-extreme/30 bg-panic-extreme/5";
      case "high": return "text-panic-high border-panic-high/30 bg-panic-high/5";
      case "elevated": return "text-panic-medium border-panic-medium/30 bg-panic-medium/5";
      default: return "text-gray-400 border-gray-700 bg-app-surface";
    }
  };

  const getIcon = (type: string) => {
     switch (type) {
      case "extreme": return "⚡";
      case "high": return "⚠️";
      case "elevated": return "👁️";
      default: return "ℹ️";
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs font-mono text-gray-400 animate-pulse">SCANNING FREQUENCIES...</div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
        <div className="text-4xl mb-4 opacity-20 grayscale">📡</div>
        <div className="text-gray-400 font-bold tracking-wide">NO ACTIVE ALERTS</div>
        <div className="text-xs text-gray-600 mt-2 font-mono uppercase">
          Global airspace nominal
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-1 overflow-hidden">
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="space-y-1 p-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`relative group rounded-lg p-4 border transition-all hover:bg-white/5 ${getAlertColor(alert.type)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getIcon(alert.type)}</span>
                  <span className="font-bold text-sm tracking-wide uppercase">{alert.region}</span>
                </div>
                <div className="text-[10px] font-mono opacity-60">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </div>
              </div>
              
              <p className="text-sm font-light leading-relaxed mb-3 text-gray-300">
                {alert.narrative}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
                <div className="flex gap-3 text-[10px] font-mono uppercase opacity-70">
                  <span>✈ {alert.flight_count} FLIGHTS</span>
                  <span>🏳 {alert.countries_involved} NATIONS</span>
                </div>
                <div className="font-mono font-bold text-xs">
                  SCORE: {alert.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
