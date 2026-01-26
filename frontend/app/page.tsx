"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PanicScoreCard from "@/components/PanicScoreCard";
import HistoricalChart from "@/components/HistoricalChart";
import ActiveAircraftList from "@/components/ActiveAircraftList";
import RealTimeStats from "@/components/RealTimeStats";
import AlertFeed from "@/components/AlertFeed";

// Dynamically import map to avoid SSR issues with Leaflet
const AircraftMap = dynamic(() => import("@/components/AircraftMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] glass-panel rounded-xl flex items-center justify-center">
      <div className="text-gray-400 font-mono animate-pulse">INITIALIZING SAT UPLINK...</div>
    </div>
  ),
});

interface PanicScore {
  region: string;
  overall_panic_score: number;
  night_flight_score: number;
  convergence_score: number;
  airlift_score: number;
  vip_movement_score: number;
  narrative: string;
  flight_count: number;
  countries_involved: number;
  timestamp: string;
}

export default function Home() {
  const [panicScores, setPanicScores] = useState<PanicScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch panic scores from API
  const fetchPanicScores = async () => {
    try {
      const response = await fetch("/api/scores");
      if (response.ok) {
        const data = await response.json();
        setPanicScores(data.scores || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch panic scores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanicScores();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPanicScores, 30000);
    return () => clearInterval(interval);
  }, []);

  const globalScore = panicScores.find((s) => s.region === "Global");

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            AIRPLANE<br/>SLEEP WATCH
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-light tracking-wide max-w-xl">
            Global geopolitical risk monitoring system tracking <span className="text-white font-medium">unusual government & military aircraft movements</span> in real-time.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">System Status</div>
          <div className="flex items-center justify-end gap-2 text-xs font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            OPERATIONAL
          </div>
        </div>
      </header>

      {/* Real-time Stats */}
      <section>
        <RealTimeStats />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {/* Global Panic Score Hero */}
          <section>
            {globalScore ? (
              <PanicScoreCard score={globalScore} size="large" />
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center">
                <div className="text-tech-blue font-mono animate-pulse">LOADING GLOBAL TELEMETRY...</div>
              </div>
            )}
          </section>

          {/* Map */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-tech-blue rounded-full"></span>
                LIVE SATELLITE TRACKING
              </h2>
              <div className="text-xs text-gray-500 font-mono">OPENSKY NET • ADS-B</div>
            </div>
            <div className="glass-panel p-1 rounded-xl">
              <AircraftMap />
            </div>
          </section>

          {/* Historical Chart */}
          {globalScore && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-tech-blue rounded-full"></span>
                  RISK TREND ANALYSIS
                </h2>
                <div className="text-xs text-gray-500 font-mono">7 DAY HISTORY</div>
              </div>
              <HistoricalChart />
            </section>
          )}
        </div>

        {/* Right Column - Feed & Regional */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alert Feed */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-panic-high rounded-full animate-pulse"></span>
                INTELLIGENCE FEED
              </h2>
            </div>
            <AlertFeed />
          </section>

          {/* Regional Scores */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                REGIONAL RISK INDEX
              </h2>
            </div>
            <div className="space-y-4">
              {panicScores
                .filter((s) => s.region !== "Global")
                .map((score) => (
                  <PanicScoreCard key={score.region} score={score} size="small" />
                ))}

              {panicScores.filter((s) => s.region !== "Global").length === 0 && (
                <div className="glass-panel rounded-xl p-8 text-center text-gray-500 text-sm font-mono">
                  NO REGIONAL ANOMALIES DETECTED
                </div>
              )}
            </div>
          </section>
          
          {/* Active Aircraft List */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-tech-blue rounded-full"></span>
                TARGET LIST
              </h2>
            </div>
            <ActiveAircraftList />
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-white/5 text-center text-gray-600 text-xs font-mono">
        <div className="mb-4 space-x-4">
          <a href="#" className="hover:text-tech-blue transition-colors">INTELLIGENCE</a>
          <a href="#" className="hover:text-tech-blue transition-colors">METHODOLOGY</a>
          <a href="#" className="hover:text-tech-blue transition-colors">API ACCESS</a>
        </div>
        <p className="mb-2 opacity-50">
          OSINT DATA SOURCES: OPENSKY NETWORK • ADS-B EXCHANGE • FLIGHTRADAR24
        </p>
        <p className="opacity-30">
          CLASSIFIED: UNRESTRICTED // PUBLIC DOMAIN
        </p>
      </footer>
    </main>
  );
}
