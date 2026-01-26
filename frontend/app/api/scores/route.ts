import { NextResponse } from "next/server";
import { queryClickHouse } from "@/lib/clickhouse";

export async function GET() {
  try {
    const scores = await queryClickHouse(`
      SELECT
        region,
        overall_panic_score,
        night_flight_score,
        convergence_score,
        airlift_score,
        vip_movement_score,
        narrative,
        flight_count,
        countries_involved,
        formatDateTime(timestamp, '%Y-%m-%d %H:%M:%S') as timestamp
      FROM panic_scores
      ORDER BY timestamp DESC, region
      LIMIT 10
    `);

    // Get latest score per region
    const latestScores = new Map();
    for (const score of scores) {
      if (!latestScores.has(score.region)) {
        latestScores.set(score.region, score);
      }
    }

    return NextResponse.json({
      scores: Array.from(latestScores.values()),
    });
  } catch (error) {
    console.error("Error fetching panic scores:", error);

    // Return mock data for development
    return NextResponse.json({
      scores: [
        {
          region: "Global",
          overall_panic_score: 28,
          night_flight_score: 12.3,
          convergence_score: 45.6,
          airlift_score: 8.2,
          vip_movement_score: 23.1,
          narrative: "⚠️ 🇺🇸 🇬🇧 🇫🇷 jets converging • 2 VIP aircraft active",
          flight_count: 45,
          countries_involved: 8,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }
}
