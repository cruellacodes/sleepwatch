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

interface PanicScoreCardProps {
  score: PanicScore;
  size: "small" | "large";
}

export default function PanicScoreCard({ score, size }: PanicScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-panic-extreme drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    if (score >= 50) return "text-panic-high drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]";
    if (score >= 25) return "text-panic-medium";
    return "text-panic-low";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 75) return "border-panic-extreme/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
    if (score >= 50) return "border-panic-high/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]";
    if (score >= 25) return "border-panic-medium/50";
    return "border-panic-low/50";
  };

  const getMetricColor = (val: number) => {
    if (val >= 75) return "text-panic-extreme";
    if (val >= 50) return "text-panic-high";
    if (val >= 25) return "text-panic-medium";
    return "text-panic-low";
  };

  const getTrendIcon = (score: number) => {
    // Using more abstract/tech icons
    if (score >= 75) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 25) return "ELEVATED";
    return "NORMAL";
  };

  if (size === "large") {
    return (
      <div className={`glass-panel rounded-2xl p-8 relative overflow-hidden transition-all duration-500 hover:border-opacity-100 border-opacity-50 ${getScoreBorder(score.overall_panic_score)}`}>
        {/* Background ambient glow - reduced for tactical feel */}
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[150px] opacity-10 ${score.overall_panic_score >= 50 ? 'bg-panic-high' : 'bg-gray-500'}`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          {/* Main Score Column */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center md:border-r border-white/10 md:pr-8">
            <div className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-2">Global Risk Index</div>
            <div className={`text-8xl font-black font-mono tracking-tighter ${getScoreColor(score.overall_panic_score)}`}>
              {score.overall_panic_score}
            </div>
            <div className="mt-2 px-3 py-1 rounded-full bg-app-surface border border-white/10 text-xs font-bold tracking-widest">
              STATUS: <span className={getMetricColor(score.overall_panic_score)}>{getTrendIcon(score.overall_panic_score)}</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-gray-100 mb-4 font-mono tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-tech-blue rounded-sm"></span>
              SITUATION REPORT
            </h3>
            
            <p className="text-lg text-gray-300 leading-relaxed mb-8 font-light border-l-2 border-white/5 pl-4">
              {score.narrative}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Night Ops", value: score.night_flight_score },
                { label: "Convergence", value: score.convergence_score },
                { label: "Airlift", value: score.airlift_score },
                { label: "VIP Transit", value: score.vip_movement_score },
              ].map((metric) => (
                <div key={metric.label} className="bg-app-surface/30 rounded-lg p-3 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{metric.label}</div>
                  <div className="flex items-end gap-2">
                    <div className={`text-2xl font-bold font-mono ${getMetricColor(metric.value)}`}>
                      {metric.value.toFixed(0)}
                    </div>
                    <div className="h-1.5 flex-grow bg-gray-800 rounded-full mb-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${metric.value >= 50 ? 'bg-panic-high' : 'bg-tech-blue'}`} 
                        style={{ width: `${Math.min(100, metric.value)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Small card
  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-200 text-lg tracking-tight">{score.region}</h4>
          <div className="text-[10px] text-gray-500 font-mono uppercase mt-1">
            {score.flight_count} ACTIVE • {score.countries_involved} NATIONS
          </div>
        </div>
        <div className={`text-3xl font-black font-mono ${getScoreColor(score.overall_panic_score)}`}>
          {score.overall_panic_score}
        </div>
      </div>

      <div className="h-1 w-full bg-gray-800 rounded-full mb-4 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            score.overall_panic_score >= 75 ? 'bg-panic-extreme' :
            score.overall_panic_score >= 50 ? 'bg-panic-high' :
            score.overall_panic_score >= 25 ? 'bg-panic-medium' : 'bg-panic-low'
          }`}
          style={{ width: `${score.overall_panic_score}%` }}
        ></div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 min-h-[2.5em]">
        {score.narrative}
      </p>
    </div>
  );
}
