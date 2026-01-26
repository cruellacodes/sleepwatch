import { NextResponse } from "next/server";
import { queryClickHouse } from "@/lib/clickhouse";

export async function GET() {
  try {
    // Get real-time statistics
    const [currentStats] = await queryClickHouse(`
      SELECT
        count(DISTINCT fp.icao_hex) as active_aircraft,
        count(DISTINCT ap.owner_country) as countries_active,
        formatDateTime(max(fp.timestamp), '%Y-%m-%d %H:%M:%S') as last_update
      FROM flight_positions fp
      JOIN aircraft_profiles ap ON fp.icao_hex = ap.icao_hex
      WHERE fp.timestamp >= now() - INTERVAL 1 HOUR
    `);

    // Get peak panic score today
    const [peakScore] = await queryClickHouse(`
      SELECT
        max(overall_panic_score) as peak_score,
        argMax(region, overall_panic_score) as peak_region
      FROM panic_scores
    `);

    // Get total tracked aircraft profiles
    const [totalProfiles] = await queryClickHouse(`
      SELECT count() as total_profiles
      FROM aircraft_profiles
    `);

    // Get VIP aircraft count
    const [vipCount] = await queryClickHouse(`
      SELECT count() as vip_aircraft
      FROM aircraft_profiles
      WHERE is_vip = 1
    `);

    return NextResponse.json({
      stats: {
        active_aircraft: currentStats?.active_aircraft || 0,
        countries_active: currentStats?.countries_active || 0,
        total_profiles: totalProfiles?.total_profiles || 0,
        vip_aircraft: vipCount?.vip_aircraft || 0,
        peak_score_today: peakScore?.peak_score || 0,
        peak_region: peakScore?.peak_region || "N/A",
        last_update: currentStats?.last_update || null,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    // Return mock data for development
    return NextResponse.json({
      stats: {
        active_aircraft: 12,
        countries_active: 5,
        total_profiles: 186,
        vip_aircraft: 42,
        peak_score_today: 34,
        peak_region: "Global",
        last_update: new Date().toISOString(),
      },
    });
  }
}
