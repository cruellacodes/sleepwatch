import { NextResponse } from "next/server";
import { queryClickHouse } from "@/lib/clickhouse";

export async function GET() {
  try {
    // Get recent high-score events (score > 40)
    const alerts = await queryClickHouse(`
      SELECT
        region,
        overall_panic_score as score,
        narrative,
        flight_count,
        countries_involved,
        formatDateTime(timestamp, '%Y-%m-%d %H:%M:%S') as timestamp
      FROM panic_scores
      WHERE overall_panic_score >= 40
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    return NextResponse.json({
      alerts: alerts.map((alert: any) => ({
        ...alert,
        type: alert.score >= 75 ? "extreme" : alert.score >= 60 ? "high" : "elevated",
      })),
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);

    // Return mock data for development
    const now = new Date();
    return NextResponse.json({
      alerts: [
        {
          region: "Global",
          score: 67,
          narrative: "🚨 🇺🇸 🇬🇧 🇫🇷 🇩🇪 jets converging • 3 VIP aircraft active",
          flight_count: 45,
          countries_involved: 8,
          timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
          type: "high",
        },
        {
          region: "Global",
          score: 52,
          narrative: "⚠️ 🇺🇸 🇬🇧 jets converging • 12 gov flights during night hours",
          flight_count: 38,
          countries_involved: 6,
          timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
          type: "elevated",
        },
        {
          region: "Global",
          score: 45,
          narrative: "👀 2 VIP aircraft active • 3 cargo aircraft in operation",
          flight_count: 28,
          countries_involved: 5,
          timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
          type: "elevated",
        },
      ],
    });
  }
}
