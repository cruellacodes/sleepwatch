import { NextResponse } from "next/server";
import { queryClickHouse } from "@/lib/clickhouse";

export async function GET() {
  try {
    const aircraft = await queryClickHouse(`
      SELECT
        fp.icao_hex,
        any(fp.callsign) as callsign,
        any(ap.owner_country) as owner_country,
        any(ap.owner_org) as owner_org,
        any(ap.aircraft_type) as aircraft_type,
        any(ap.is_vip) as is_vip,
        any(ap.vip_tier) as vip_tier,
        toString(max(fp.timestamp)) as last_seen
      FROM flight_positions fp
      JOIN aircraft_profiles ap ON fp.icao_hex = ap.icao_hex
      WHERE fp.timestamp >= now() - INTERVAL 1 HOUR
      GROUP BY fp.icao_hex
      ORDER BY last_seen DESC
      LIMIT 50
    `);

    return NextResponse.json({
      aircraft,
    });
  } catch (error) {
    console.error("Error fetching active aircraft:", error);

    return NextResponse.json({
      aircraft: [],
    });
  }
}
