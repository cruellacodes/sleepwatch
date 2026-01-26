#!/usr/bin/env python3
"""
OpenSky Network data ingestion pipeline
Polls OpenSky API and stores gov/mil/VIP aircraft positions to ClickHouse
"""

import os
import time
import requests
from datetime import datetime, timezone
from typing import List, Dict, Optional
from clickhouse_driver import Client
from dotenv import load_dotenv

load_dotenv()


class OpenSkyIngester:
    """Ingests aircraft position data from OpenSky Network API"""

    BASE_URL = "https://opensky-network.org/api"

    def __init__(self):
        self.username = os.getenv("OPENSKY_USERNAME")
        self.password = os.getenv("OPENSKY_PASSWORD")

        # ClickHouse connection
        self.ch_client = Client(
            host=os.getenv("CLICKHOUSE_HOST", "localhost"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            database=os.getenv("CLICKHOUSE_DB", "airplane_watch"),
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", "")
        )

        # Cache of tracked ICAO hex codes (gov/mil/VIP only)
        self.tracked_aircraft = self._load_tracked_aircraft()
        print(f"Loaded {len(self.tracked_aircraft)} tracked aircraft from database")

    def _load_tracked_aircraft(self) -> set:
        """Load ICAO hex codes of aircraft we care about from aircraft_profiles table"""
        try:
            result = self.ch_client.execute("SELECT icao_hex FROM aircraft_profiles")
            return {row[0].lower() for row in result}
        except Exception as e:
            print(f"Warning: Could not load aircraft_profiles: {e}")
            print("Make sure to populate aircraft_profiles table with seed data")
            return set()

    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make authenticated request to OpenSky API with rate limiting"""
        url = f"{self.BASE_URL}/{endpoint}"

        auth = None
        if self.username and self.password:
            auth = (self.username, self.password)

        try:
            response = requests.get(url, params=params, auth=auth, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return None

    def get_all_states(self, icao24_filter: Optional[List[str]] = None) -> List[Dict]:
        """
        Fetch current state vectors for all aircraft (or filtered list)

        Returns list of aircraft states with fields:
        - icao24, callsign, origin_country, time_position, last_contact
        - longitude, latitude, baro_altitude, on_ground, velocity
        - true_track, vertical_rate, sensors, geo_altitude, squawk, spi
        """
        params = {}
        if icao24_filter:
            # OpenSky supports filtering by ICAO24 (comma-separated)
            params["icao24"] = ",".join(icao24_filter)

        data = self._make_request("states/all", params)

        if not data or "states" not in data:
            return []

        # Parse state vectors into dicts
        states = []
        for state in data["states"]:
            if state is None:
                continue

            # State vector indices per OpenSky API docs
            states.append({
                "icao24": state[0],
                "callsign": state[1].strip() if state[1] else "",
                "origin_country": state[2],
                "time_position": state[3],
                "last_contact": state[4],
                "longitude": state[5],
                "latitude": state[6],
                "baro_altitude": state[7],
                "on_ground": state[8],
                "velocity": state[9],
                "true_track": state[10],
                "vertical_rate": state[11],
                "geo_altitude": state[13],
                "squawk": state[14],
            })

        return states

    def filter_tracked_aircraft(self, states: List[Dict]) -> List[Dict]:
        """Filter state vectors to only tracked gov/mil/VIP aircraft"""
        if not self.tracked_aircraft:
            print("Warning: No tracked aircraft loaded, nothing will be stored")
            return []

        return [s for s in states if s["icao24"].lower() in self.tracked_aircraft]

    def store_positions(self, states: List[Dict]) -> int:
        """Store aircraft positions to ClickHouse"""
        if not states:
            return 0

        # Prepare batch insert
        rows = []
        timestamp = datetime.now(timezone.utc)

        for state in states:
            # Skip if missing critical data
            if state["latitude"] is None or state["longitude"] is None:
                continue

            rows.append({
                "timestamp": timestamp,
                "icao_hex": state["icao24"].upper(),
                "callsign": state["callsign"],
                "lat": state["latitude"],
                "lon": state["longitude"],
                "altitude": int(state["baro_altitude"]) if state["baro_altitude"] is not None else 0,
                "ground_speed": int(state["velocity"]) if state["velocity"] is not None else 0,
                "heading": int(state["true_track"]) if state["true_track"] is not None else 0,
                "vertical_rate": int(state["vertical_rate"]) if state["vertical_rate"] is not None else 0,
                "on_ground": 1 if state["on_ground"] else 0,
                "source": "opensky"
            })

        if not rows:
            return 0

        # Batch insert
        self.ch_client.execute(
            """
            INSERT INTO flight_positions
            (timestamp, icao_hex, callsign, lat, lon, altitude,
             ground_speed, heading, vertical_rate, on_ground, source)
            VALUES
            """,
            rows
        )

        return len(rows)

    def poll_once(self) -> Dict:
        """Single poll cycle - fetch and store data"""
        print(f"[{datetime.now(timezone.utc).isoformat()}] Polling OpenSky API...")

        # Fetch all states (OpenSky doesn't support ICAO filter efficiently,
        # so we fetch all and filter locally for now)
        all_states = self.get_all_states()

        print(f"  Received {len(all_states)} total aircraft")

        # Filter to tracked aircraft only
        tracked_states = self.filter_tracked_aircraft(all_states)

        print(f"  Found {len(tracked_states)} tracked gov/mil/VIP aircraft")

        # Store to database
        stored_count = self.store_positions(tracked_states)

        print(f"  Stored {stored_count} position records")

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_aircraft": len(all_states),
            "tracked_aircraft": len(tracked_states),
            "stored_records": stored_count
        }

    def run_continuous(self, interval_seconds: int = 10):
        """Run continuous polling loop"""
        print(f"Starting continuous ingestion (polling every {interval_seconds}s)")
        print("Press Ctrl+C to stop\n")

        while True:
            try:
                result = self.poll_once()

                # Sleep until next poll
                time.sleep(interval_seconds)

            except KeyboardInterrupt:
                print("\nShutting down gracefully...")
                break
            except Exception as e:
                print(f"Error in poll cycle: {e}")
                print("Waiting 30s before retry...")
                time.sleep(30)


def main():
    """Main entry point"""
    ingester = OpenSkyIngester()

    poll_interval = int(os.getenv("POLL_INTERVAL", 10))
    ingester.run_continuous(interval_seconds=poll_interval)


if __name__ == "__main__":
    main()
