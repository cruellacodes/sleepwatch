"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";

interface HistoricalDataPoint {
  timestamp: string;
  score: number;
}

export default function HistoricalChart() {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch("/api/history?region=Global&days=7");
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center h-[300px] flex items-center justify-center">
        <div className="text-gray-500 font-mono text-xs animate-pulse">LOADING HISTORICAL ARCHIVES...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center h-[300px] flex items-center justify-center">
        <div className="text-gray-500 font-mono text-xs">INSUFFICIENT DATA POINTS</div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-6 h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="timestamp"
            stroke="#6B7280"
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(value) => format(new Date(value), "MM/dd")}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fill: "#6B7280", fontSize: 10, fontFamily: 'monospace' }}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              color: "#f3f4f6",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              fontFamily: "monospace",
              fontSize: "12px"
            }}
            labelFormatter={(value) => format(new Date(value as string), "PP pp")}
            formatter={(value: number) => [
              <span key="val" className="text-tech-blue font-bold">{value.toFixed(1)}</span>, 
              "RISK INDEX"
            ]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#0EA5E9"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
