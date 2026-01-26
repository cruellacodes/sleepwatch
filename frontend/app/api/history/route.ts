import { NextResponse } from "next/server";
import { queryClickHouse } from "@/lib/clickhouse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "Global";
  const days = parseInt(searchParams.get("days") || "7");

  try {
    const data = await queryClickHouse(`
      SELECT
        formatDateTime(timestamp, '%Y-%m-%d %H:%M:%S') as timestamp,
        overall_panic_score as score
      FROM panic_scores
      WHERE region = '${region}'
      ORDER BY timestamp ASC
      LIMIT 1000
    `);

    return NextResponse.json({
      data,
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);

    return NextResponse.json({
      data: [],
    });
  }
}
