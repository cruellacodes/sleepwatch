#!/usr/bin/env python3
"""
Test script to verify setup is working correctly
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def test_clickhouse_connection():
    """Test ClickHouse connection"""
    print("Testing ClickHouse connection...")

    try:
        from clickhouse_driver import Client

        client = Client(
            host=os.getenv("CLICKHOUSE_HOST", "localhost"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            database=os.getenv("CLICKHOUSE_DB", "airplane_watch"),
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", "")
        )

        result = client.execute("SELECT 1")
        print("  ✓ ClickHouse connection successful")
        return True

    except Exception as e:
        print(f"  ✗ ClickHouse connection failed: {e}")
        return False


def test_database_schema():
    """Test that database and tables exist"""
    print("\nTesting database schema...")

    try:
        from clickhouse_driver import Client

        client = Client(
            host=os.getenv("CLICKHOUSE_HOST", "localhost"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", "")
        )

        # Check if database exists
        result = client.execute("SHOW DATABASES")
        databases = [row[0] for row in result]

        db_name = os.getenv("CLICKHOUSE_DB", "airplane_watch")
        if db_name not in databases:
            print(f"  ✗ Database '{db_name}' not found")
            print(f"    Run: python scripts/setup_db.py")
            return False

        print(f"  ✓ Database '{db_name}' exists")

        # Check tables
        client = Client(
            host=os.getenv("CLICKHOUSE_HOST", "localhost"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            database=db_name,
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", "")
        )

        result = client.execute("SHOW TABLES")
        tables = [row[0] for row in result]

        required_tables = [
            "aircraft_profiles",
            "flight_positions",
            "flight_events",
            "airports",
            "panic_scores"
        ]

        missing_tables = [t for t in required_tables if t not in tables]

        if missing_tables:
            print(f"  ✗ Missing tables: {', '.join(missing_tables)}")
            print(f"    Run: python scripts/setup_db.py")
            return False

        print(f"  ✓ All required tables exist")
        return True

    except Exception as e:
        print(f"  ✗ Schema check failed: {e}")
        return False


def test_aircraft_profiles():
    """Test that aircraft_profiles is populated"""
    print("\nTesting aircraft profiles...")

    try:
        from clickhouse_driver import Client

        client = Client(
            host=os.getenv("CLICKHOUSE_HOST", "localhost"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            database=os.getenv("CLICKHOUSE_DB", "airplane_watch"),
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", "")
        )

        result = client.execute("SELECT count() FROM aircraft_profiles")
        count = result[0][0]

        if count == 0:
            print(f"  ✗ aircraft_profiles is empty")
            print(f"    Run: python scripts/seed_aircraft.py")
            return False

        print(f"  ✓ aircraft_profiles has {count} aircraft")

        # Show sample
        result = client.execute("""
            SELECT owner_country, count() as cnt
            FROM aircraft_profiles
            GROUP BY owner_country
            ORDER BY cnt DESC
            LIMIT 5
        """)

        print(f"    Top countries:")
        for country, cnt in result:
            print(f"      {country}: {cnt} aircraft")

        return True

    except Exception as e:
        print(f"  ✗ Aircraft profiles check failed: {e}")
        return False


def test_opensky_api():
    """Test OpenSky API access"""
    print("\nTesting OpenSky API...")

    try:
        import requests

        username = os.getenv("OPENSKY_USERNAME")
        password = os.getenv("OPENSKY_PASSWORD")

        auth = None
        if username and password:
            auth = (username, password)
            print(f"  Using authenticated access (user: {username})")
        else:
            print(f"  Using anonymous access (limited rate limits)")

        response = requests.get(
            "https://opensky-network.org/api/states/all",
            auth=auth,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            aircraft_count = len(data.get("states", []))
            print(f"  ✓ OpenSky API accessible ({aircraft_count} aircraft visible)")
            return True
        else:
            print(f"  ✗ OpenSky API error: HTTP {response.status_code}")
            return False

    except Exception as e:
        print(f"  ✗ OpenSky API test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("="*60)
    print("AIRPLANE SLEEP WATCH - SETUP TEST")
    print("="*60)
    print()

    tests = [
        test_clickhouse_connection,
        test_database_schema,
        test_aircraft_profiles,
        test_opensky_api
    ]

    results = []
    for test in tests:
        results.append(test())

    print()
    print("="*60)

    if all(results):
        print("✓ ALL TESTS PASSED")
        print()
        print("You're ready to start tracking!")
        print()
        print("Next steps:")
        print("  1. Start ingestion: python src/ingest_opensky.py")
        print("  2. Wait 5-10 minutes for data collection")
        print("  3. Calculate panic score: python src/calculate_panic.py")
        print()
    else:
        print("✗ SOME TESTS FAILED")
        print()
        print("Fix the issues above and run this test again:")
        print("  python scripts/test_setup.py")
        print()
        sys.exit(1)

    print("="*60)


if __name__ == "__main__":
    main()
