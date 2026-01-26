#!/usr/bin/env python3
"""
Expand aircraft database by downloading ADS-B Exchange data
and adding high-value military/government aircraft
"""

import os
import csv
import json
import gzip
import urllib.request
from datetime import datetime
from collections import defaultdict

# Priority aircraft types to add
PRIORITY_TYPES = {
    # Tankers (strategic indicator)
    "KC-135": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},
    "KC-46": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},
    "KC-10": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},

    # ISR (high intelligence value)
    "P-8": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},
    "RC-135": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},
    "E-3": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},
    "E-8": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},
    "U-2": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},

    # Transport (deployment indicator)
    "C-17": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},
    "C-130": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},
    "C-5": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},
    "A400M": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},
    "Il-76": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4},

    # Special Ops
    "MC-130": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},
    "CV-22": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3},

    # Bombers (escalation indicator)
    "B-52": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 3},
    "B-1": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 3},
    "B-2": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 2},
    "Tu-95": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 3},
    "Tu-160": {"is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 2},
}

# Additional high-value government aircraft
HIGH_VALUE_AIRCRAFT = [
    # South Africa
    {"icao_hex": "00AEC9", "registration": "ZS-RSA", "aircraft_type": "Boeing 737-7ED", "owner_country": "ZA",
     "owner_org": "South African AF", "is_military": 1, "is_government": 1, "is_vip": 1, "is_intel": 0, "vip_tier": 1,
     "home_base_airport": "FAWB", "notes": "South African Presidential aircraft - LMG1"},

    # Nigeria
    {"icao_hex": "4241AC", "registration": "5N-FGA", "aircraft_type": "Airbus A330-243", "owner_country": "NG",
     "owner_org": "Nigerian AF", "is_military": 1, "is_government": 1, "is_vip": 1, "is_intel": 0, "vip_tier": 1,
     "home_base_airport": "DNAA", "notes": "Nigerian Presidential aircraft - Eagle One"},

    # Kenya
    {"icao_hex": "04C030", "registration": "KAF308", "aircraft_type": "Fokker 70", "owner_country": "KE",
     "owner_org": "Kenya AF", "is_military": 1, "is_government": 1, "is_vip": 1, "is_intel": 0, "vip_tier": 1,
     "home_base_airport": "HKJK", "notes": "Kenyan Presidential aircraft - Harambee One"},

    # Argentina
    {"icao_hex": "E200DD", "registration": "ARG-01", "aircraft_type": "Boeing 757-256", "owner_country": "AR",
     "owner_org": "Argentine AF", "is_military": 1, "is_government": 1, "is_vip": 1, "is_intel": 0, "vip_tier": 1,
     "home_base_airport": "SAEZ", "notes": "Argentine Presidential aircraft"},

    # More US tankers
    {"icao_hex": "AE0590", "registration": "58-0066", "aircraft_type": "Boeing KC-135R", "owner_country": "US",
     "owner_org": "USAF", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4,
     "home_base_airport": "KMCF", "notes": "KC-135 Stratotanker"},

    {"icao_hex": "AE05B1", "registration": "63-8878", "aircraft_type": "Boeing KC-135R", "owner_country": "US",
     "owner_org": "USAF", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4,
     "home_base_airport": "KMCF", "notes": "KC-135 Stratotanker"},

    {"icao_hex": "AE63BE", "registration": "20-46082", "aircraft_type": "Boeing KC-46A", "owner_country": "US",
     "owner_org": "USAF", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 4,
     "home_base_airport": "KPAE", "notes": "KC-46 Pegasus tanker"},

    # More US ISR
    {"icao_hex": "AE222C", "registration": "167951", "aircraft_type": "Boeing P-8A", "owner_country": "US",
     "owner_org": "US Navy", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 4,
     "home_base_airport": "KNTU", "notes": "P-8 Poseidon maritime patrol"},

    {"icao_hex": "AE222D", "registration": "167952", "aircraft_type": "Boeing P-8A", "owner_country": "US",
     "owner_org": "US Navy", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 4,
     "home_base_airport": "KNTU", "notes": "P-8 Poseidon maritime patrol"},

    {"icao_hex": "AE01CE", "registration": "64-14841", "aircraft_type": "Boeing RC-135W", "owner_country": "US",
     "owner_org": "USAF", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3,
     "home_base_airport": "KOFF", "notes": "RC-135 Rivet Joint - Signals Intelligence"},

    # US Bombers
    {"icao_hex": "AE5582", "registration": "60-0032", "aircraft_type": "Boeing B-52H", "owner_country": "US",
     "owner_org": "USAF", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 0, "vip_tier": 3,
     "home_base_airport": "KBAD", "notes": "B-52 Stratofortress strategic bomber"},

    # Special Ops
    {"icao_hex": "AE540C", "registration": "11-0060", "aircraft_type": "Boeing CV-22B", "owner_country": "US",
     "owner_org": "USAF", "is_military": 1, "is_government": 0, "is_vip": 0, "is_intel": 1, "vip_tier": 3,
     "home_base_airport": "KHRT", "notes": "CV-22 Osprey special operations"},
]


def load_existing_aircraft():
    """Load existing aircraft to avoid duplicates"""
    existing = set()
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "aircraft_profiles.csv")

    try:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing.add(row["icao_hex"].upper())
    except Exception as e:
        print(f"Warning: Could not load existing aircraft: {e}")

    return existing


def add_high_value_aircraft(existing_aircraft):
    """Add manually curated high-value aircraft"""
    added = []

    for aircraft in HIGH_VALUE_AIRCRAFT:
        hex_code = aircraft["icao_hex"].upper()
        if hex_code not in existing_aircraft:
            added.append(aircraft)
            existing_aircraft.add(hex_code)

    return added


def download_adsbexchange_db():
    """
    Download ADS-B Exchange database
    Note: This is a large file (~50MB compressed, 300MB+ uncompressed)
    """
    url = "https://downloads.adsbexchange.com/downloads/basic-ac-db.json.gz"

    print(f"Downloading ADS-B Exchange database from {url}...")
    print("This may take a few minutes...")

    try:
        # Download compressed file
        with urllib.request.urlopen(url, timeout=300) as response:
            compressed_data = response.read()

        print(f"Downloaded {len(compressed_data) / 1024 / 1024:.1f}MB")
        print("Decompressing...")

        # Decompress
        data = gzip.decompress(compressed_data)
        print(f"Decompressed to {len(data) / 1024 / 1024:.1f}MB")

        # Parse JSON
        print("Parsing JSON...")
        db = json.loads(data)

        print(f"Loaded {len(db)} aircraft from ADS-B Exchange database")
        return db

    except Exception as e:
        print(f"Error downloading ADS-B Exchange database: {e}")
        print("\nYou can manually download from:")
        print("https://downloads.adsbexchange.com/downloads/basic-ac-db.json.gz")
        return None


def filter_priority_aircraft(adsbex_db, existing_aircraft, max_per_type=50):
    """
    Filter ADS-B Exchange database for priority aircraft types
    """
    if not adsbex_db:
        return []

    added = []
    type_counts = defaultdict(int)

    print("\nFiltering for priority aircraft types...")

    for icao_hex, aircraft_data in adsbex_db.items():
        # Skip if we already have it
        if icao_hex.upper() in existing_aircraft:
            continue

        # Check if aircraft is in our priority list
        aircraft_type = aircraft_data.get("t", "")

        # Find matching priority type
        matched_type = None
        for priority_type in PRIORITY_TYPES:
            if priority_type in aircraft_type:
                matched_type = priority_type
                break

        if not matched_type:
            continue

        # Limit per type to avoid database bloat
        if type_counts[matched_type] >= max_per_type:
            continue

        # Extract data
        registration = aircraft_data.get("r", "")
        owner_country = "US" if icao_hex.upper().startswith("A") else "??"

        # Build aircraft entry
        entry = {
            "icao_hex": icao_hex.upper(),
            "registration": registration,
            "aircraft_type": aircraft_type,
            "owner_country": owner_country,
            "owner_org": "USAF" if owner_country == "US" else "Unknown",
            **PRIORITY_TYPES[matched_type],
            "home_base_airport": "",
            "notes": f"Auto-added from ADS-B Exchange - {matched_type}",
        }

        added.append(entry)
        existing_aircraft.add(icao_hex.upper())
        type_counts[matched_type] += 1

    # Print summary
    print(f"\nAdded {len(added)} aircraft:")
    for aircraft_type, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"  {aircraft_type}: {count}")

    return added


def save_expanded_database(new_aircraft):
    """Append new aircraft to CSV"""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "aircraft_profiles.csv")

    if not new_aircraft:
        print("No new aircraft to add")
        return

    # Append to existing file
    with open(csv_path, 'a', newline='') as f:
        fieldnames = [
            "icao_hex", "registration", "aircraft_type", "owner_country", "owner_org",
            "is_military", "is_government", "is_vip", "is_intel", "vip_tier",
            "home_base_airport", "notes"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        for aircraft in new_aircraft:
            writer.writerow(aircraft)

    print(f"\nAdded {len(new_aircraft)} aircraft to {csv_path}")


def main():
    """Main expansion process"""
    print("="*60)
    print("AIRCRAFT DATABASE EXPANSION")
    print("="*60)
    print()

    # Load existing aircraft
    print("Loading existing aircraft...")
    existing = load_existing_aircraft()
    print(f"Currently tracking {len(existing)} aircraft")
    print()

    # Add manually curated high-value aircraft
    print("Adding manually curated high-value aircraft...")
    manual_aircraft = add_high_value_aircraft(existing)
    print(f"Added {len(manual_aircraft)} manually curated aircraft")
    print()

    # Ask if user wants to download ADS-B Exchange DB
    print("Download ADS-B Exchange database? (This will take 5-10 minutes)")
    print("You'll get access to thousands of military aircraft.")
    response = input("Download? (y/n): ").strip().lower()

    auto_aircraft = []
    if response == 'y':
        adsbex_db = download_adsbexchange_db()
        if adsbex_db:
            auto_aircraft = filter_priority_aircraft(adsbex_db, existing, max_per_type=50)

    # Combine all new aircraft
    all_new = manual_aircraft + auto_aircraft

    if all_new:
        print(f"\n{'='*60}")
        print(f"TOTAL NEW AIRCRAFT: {len(all_new)}")
        print(f"  Manually curated: {len(manual_aircraft)}")
        print(f"  Auto-discovered: {len(auto_aircraft)}")
        print(f"  New total: {len(existing) + len(all_new)}")
        print(f"{'='*60}\n")

        save_expanded_database(all_new)

        print("\n✓ Database expansion complete!")
        print("\nNext steps:")
        print("  1. Re-seed the database: python scripts/seed_aircraft.py")
        print("  2. Restart ingestion pipeline")
        print("  3. Watch for expanded coverage!")
    else:
        print("\nNo new aircraft added")


if __name__ == "__main__":
    main()
