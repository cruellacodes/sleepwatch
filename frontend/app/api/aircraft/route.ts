import { NextResponse } from "next/server";
import { queryClickHouse } from "@/lib/clickhouse";

export async function GET() {
  try {
    const aircraft = await queryClickHouse(`
      SELECT
        fp.icao_hex,
        fp.callsign,
        fp.lat,
        fp.lon,
        fp.altitude,
        fp.ground_speed,
        fp.heading,
        ap.owner_country,
        ap.owner_org,
        ap.aircraft_type,
        ap.is_vip,
        ap.vip_tier,
        formatDateTime(max(fp.timestamp), '%Y-%m-%d %H:%M:%S') as last_update
      FROM flight_positions fp
      JOIN aircraft_profiles ap ON fp.icao_hex = ap.icao_hex
      WHERE fp.timestamp >= now() - INTERVAL 30 MINUTE
      GROUP BY
        fp.icao_hex,
        fp.callsign,
        fp.lat,
        fp.lon,
        fp.altitude,
        fp.ground_speed,
        fp.heading,
        ap.owner_country,
        ap.owner_org,
        ap.aircraft_type,
        ap.is_vip,
        ap.vip_tier
      ORDER BY last_update DESC
      LIMIT 100
    `);

    return NextResponse.json({
      aircraft,
    });
  } catch (error) {
    console.error("Error fetching aircraft:", error);

    // Return empty for development
    return NextResponse.json({
      aircraft: [],
    });
  }
}
