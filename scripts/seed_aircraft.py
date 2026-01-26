#!/usr/bin/env python3
"""
Seed aircraft_profiles table with curated gov/mil/VIP aircraft data
"""

import os
import csv
from datetime import datetime, timezone
from clickhouse_driver import Client
from dotenv import load_dotenv

load_dotenv()


def seed_aircraft_profiles():
    """Load aircraft profiles from CSV into ClickHouse"""

    # Connect to ClickHouse
    client = Client(
        host=os.getenv("CLICKHOUSE_HOST", "localhost"),
        port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
        database=os.getenv("CLICKHOUSE_DB", "airplane_watch"),
        user=os.getenv("CLICKHOUSE_USER", "default"),
        password=os.getenv("CLICKHOUSE_PASSWORD", "")
    )

    # Read CSV
    csv_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "data",
        "aircraft_profiles.csv"
    )

    rows = []
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "icao_hex": row["icao_hex"].upper(),
                "registration": row["registration"],
                "aircraft_type": row["aircraft_type"],
                "owner_country": row["owner_country"],
                "owner_org": row["owner_org"],
                "is_military": int(row["is_military"]),
                "is_government": int(row["is_government"]),
                "is_vip": int(row["is_vip"]),
                "is_intel": int(row["is_intel"]),
                "vip_tier": int(row["vip_tier"]),
                "home_base_airport": row["home_base_airport"],
                "notes": row["notes"],
                "last_updated": datetime.now(timezone.utc)
            })

    print(f"Loading {len(rows)} aircraft profiles...")

    # Clear existing data (optional - remove if you want to preserve manual additions)
    print("  Clearing existing aircraft_profiles table...")
    client.execute("TRUNCATE TABLE aircraft_profiles")

    # Insert data
    client.execute(
        """
        INSERT INTO aircraft_profiles
        (icao_hex, registration, aircraft_type, owner_country, owner_org,
         is_military, is_government, is_vip, is_intel, vip_tier,
         home_base_airport, notes, last_updated)
        VALUES
        """,
        rows
    )

    print(f"  ✓ Loaded {len(rows)} aircraft profiles")

    # Show summary by country
    result = client.execute("""
        SELECT
            owner_country,
            count() as total,
            sum(is_vip) as vip_count,
            sum(is_military) as military_count
        FROM aircraft_profiles
        GROUP BY owner_country
        ORDER BY total DESC
    """)

    print("\nSummary by country:")
    print(f"  {'Country':<10} {'Total':<8} {'VIP':<8} {'Military':<10}")
    print(f"  {'-'*40}")
    for row in result:
        country, total, vip, military = row
        print(f"  {country:<10} {total:<8} {vip:<8} {military:<10}")

    print("\n✓ Database seeded successfully!")
    print("\nNext step: Start the ingestion pipeline")
    print("  python src/ingest_opensky.py")


if __name__ == "__main__":
    seed_aircraft_profiles()
