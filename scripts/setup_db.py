#!/usr/bin/env python3
"""
Database setup script
Runs the ClickHouse schema creation
"""

import os
from clickhouse_driver import Client
from dotenv import load_dotenv

load_dotenv()


def setup_database():
    """Create database and tables"""

    # Connect without specifying database first
    client = Client(
        host=os.getenv("CLICKHOUSE_HOST", "localhost"),
        port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
        user=os.getenv("CLICKHOUSE_USER", "default"),
        password=os.getenv("CLICKHOUSE_PASSWORD", "")
    )

    # Read schema file
    schema_path = os.path.join(os.path.dirname(__file__), "..", "src", "db_schema.sql")

    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    # Split by semicolon and execute each statement
    statements = [s.strip() for s in schema_sql.split(';') if s.strip() and not s.strip().startswith('--')]

    print("Setting up database schema...")

    for stmt in statements:
        if stmt:
            try:
                client.execute(stmt)
                # Extract table name for logging
                if "CREATE TABLE" in stmt.upper():
                    table_name = stmt.split("IF NOT EXISTS")[1].split("(")[0].strip() if "IF NOT EXISTS" in stmt else "unknown"
                    print(f"  ✓ Created table: {table_name}")
                elif "CREATE DATABASE" in stmt.upper():
                    print(f"  ✓ Created database")
            except Exception as e:
                print(f"  ✗ Error executing statement: {e}")
                print(f"    Statement: {stmt[:100]}...")

    print("\nDatabase setup complete!")
    print("\nNext steps:")
    print("1. Populate aircraft_profiles with seed data (run scripts/seed_aircraft.py)")
    print("2. Start the ingestion pipeline (python src/ingest_opensky.py)")


if __name__ == "__main__":
    setup_database()
