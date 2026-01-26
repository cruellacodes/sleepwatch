// ClickHouse client for Next.js API routes
// Uses HTTP interface since we're in a browser environment

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || "http://localhost:8123";
const CLICKHOUSE_DB = process.env.CLICKHOUSE_DB || "airplane_watch";

export async function queryClickHouse(query: string) {
  const url = `${CLICKHOUSE_URL}/?database=${CLICKHOUSE_DB}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: query + " FORMAT JSON",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickHouse query failed: ${error}`);
  }

  const result = await response.json();
  return result.data || [];
}
