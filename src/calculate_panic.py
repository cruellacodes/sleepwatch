#!/usr/bin/env python3
"""
Panic Score calculation engine
Analyzes flight activity and computes regional panic scores (0-100)
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple
from collections import defaultdict
from clickhouse_driver import Client
from dotenv import load_dotenv
import math

load_dotenv()


class PanicScoreCalculator:
    """Calculates panic scores based on unusual aircraft movements"""

    def __init__(self):
        self.ch_client = Client(
            host=os.getenv("CLICKHOUSE_HOST", "localhost"),
            port=int(os.getenv("CLICKHOUSE_PORT", 9000)),
            database=os.getenv("CLICKHOUSE_DB", "airplane_watch"),
            user=os.getenv("CLICKHOUSE_USER", "default"),
            password=os.getenv("CLICKHOUSE_PASSWORD", "")
        )

        # Country to emoji flag mapping
        self.country_flags = {
            "US": "🇺🇸", "GB": "🇬🇧", "FR": "🇫🇷", "DE": "🇩🇪", "IT": "🇮🇹",
            "ES": "🇪🇸", "NL": "🇳🇱", "PL": "🇵🇱", "TR": "🇹🇷", "RU": "🇷🇺",
            "CN": "🇨🇳", "SA": "🇸🇦", "AE": "🇦🇪", "IL": "🇮🇱", "CL": "🇨🇱",
            "CO": "🇨🇴"
        }

    def get_recent_flights(self, hours: int = 12) -> List[Dict]:
        """
        Get recent flight activity with aircraft metadata

        For MVP, we analyze raw positions. In production, you'd use
        the flight_events table with proper takeoff/landing detection.
        """
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)

        query = """
        SELECT
            fp.icao_hex,
            fp.callsign,
            fp.timestamp,
            fp.lat,
            fp.lon,
            fp.altitude,
            fp.on_ground,
            ap.owner_country,
            ap.owner_org,
            ap.vip_tier,
            ap.is_military,
            ap.is_vip,
            ap.aircraft_type
        FROM flight_positions fp
        JOIN aircraft_profiles ap ON fp.icao_hex = ap.icao_hex
        WHERE fp.timestamp >= %(cutoff_time)s
        ORDER BY fp.timestamp DESC
        """

        result = self.ch_client.execute(query, {"cutoff_time": cutoff_time})

        flights = []
        for row in result:
            flights.append({
                "icao_hex": row[0],
                "callsign": row[1],
                "timestamp": row[2],
                "lat": row[3],
                "lon": row[4],
                "altitude": row[5],
                "on_ground": row[6],
                "owner_country": row[7],
                "owner_org": row[8],
                "vip_tier": row[9],
                "is_military": row[10],
                "is_vip": row[11],
                "aircraft_type": row[12]
            })

        return flights

    def is_night_time(self, timestamp: datetime, lat: float, lon: float) -> bool:
        """
        Simple night detection based on UTC hour and rough longitude

        For MVP: approximate. In production, use proper timezone libraries
        and astronomical calculations.
        """
        # Rough timezone offset from longitude (15° per hour)
        tz_offset_hours = lon / 15.0
        local_hour = (timestamp.hour + tz_offset_hours) % 24

        # Night = 00:00 - 06:00 local time
        return 0 <= local_hour < 6

    def calculate_night_flight_score(self, flights: List[Dict]) -> Tuple[float, Dict]:
        """
        Calculate night flight anomaly score (0-100)

        Measures unusual gov/mil flights during night hours (00:00-06:00 local)
        """
        night_flights = []

        for flight in flights:
            if self.is_night_time(flight["timestamp"], flight["lat"], flight["lon"]):
                night_flights.append(flight)

        if not night_flights:
            return 0.0, {"count": 0, "countries": []}

        # Weight by VIP tier (presidents = 3x weight, regular = 1x)
        weighted_count = 0
        for flight in night_flights:
            tier_weight = {1: 3.0, 2: 2.0, 3: 1.5, 4: 1.0}.get(flight["vip_tier"], 1.0)
            weighted_count += tier_weight

        # Count unique countries
        unique_countries = len(set(f["owner_country"] for f in night_flights))

        # Base score from weighted count
        raw_score = min(100, weighted_count * 8)

        # Boost for multiple countries (signals coordination)
        country_multiplier = 1 + (unique_countries - 1) * 0.2
        final_score = min(100, raw_score * country_multiplier)

        context = {
            "count": len(night_flights),
            "weighted_count": weighted_count,
            "countries": list(set(f["owner_country"] for f in night_flights))
        }

        return final_score, context

    def calculate_convergence_score(self, flights: List[Dict]) -> Tuple[float, Dict]:
        """
        Calculate convergence score (0-100)

        Measures clustering of different countries' aircraft to same locations
        """
        # Group flights by approximate location (0.5° grid = ~55km)
        location_grid = defaultdict(lambda: {"countries": set(), "flights": []})

        for flight in flights:
            grid_lat = round(flight["lat"] * 2) / 2  # 0.5° buckets
            grid_lon = round(flight["lon"] * 2) / 2
            grid_key = (grid_lat, grid_lon)

            location_grid[grid_key]["countries"].add(flight["owner_country"])
            location_grid[grid_key]["flights"].append(flight)

        # Find highest convergence
        max_convergence = 0
        top_location = None

        for location, data in location_grid.items():
            country_count = len(data["countries"])

            if country_count < 2:
                continue

            # Non-linear scoring: more countries = exponentially more interesting
            convergence_score = (country_count ** 1.5) * 12

            # Boost if VIP aircraft present
            has_vip = any(f["is_vip"] for f in data["flights"])
            if has_vip:
                convergence_score *= 1.5

            if convergence_score > max_convergence:
                max_convergence = convergence_score
                top_location = {
                    "lat": location[0],
                    "lon": location[1],
                    "countries": list(data["countries"]),
                    "flight_count": len(data["flights"])
                }

        final_score = min(100, max_convergence)

        return final_score, top_location or {}

    def calculate_airlift_score(self, flights: List[Dict]) -> Tuple[float, Dict]:
        """
        Calculate airlift score (0-100)

        Detects repeated cargo/transport flights (signals logistics buildup)
        """
        # Cargo/transport aircraft types
        airlift_types = ["C-17", "C-130", "A400M", "Il-76", "C-5", "An-124"]

        airlift_flights = [
            f for f in flights
            if any(aircraft_type in f["aircraft_type"] for aircraft_type in airlift_types)
        ]

        if not airlift_flights:
            return 0.0, {"count": 0}

        # Count unique aircraft making multiple position reports (= active missions)
        aircraft_activity = defaultdict(int)
        for flight in airlift_flights:
            aircraft_activity[flight["icao_hex"]] += 1

        # Active aircraft = more than 5 position reports in window
        active_aircraft = sum(1 for count in aircraft_activity.values() if count > 5)

        # Score based on number of active airlift missions
        base_score = active_aircraft * 15

        # Boost for military aircraft
        military_count = sum(1 for f in airlift_flights if f["is_military"])
        military_ratio = military_count / len(airlift_flights) if airlift_flights else 0
        military_multiplier = 1 + (military_ratio * 0.5)

        final_score = min(100, base_score * military_multiplier)

        return final_score, {
            "total_flights": len(airlift_flights),
            "active_aircraft": active_aircraft,
            "military_ratio": military_ratio
        }

    def calculate_vip_score(self, flights: List[Dict]) -> Tuple[float, Dict]:
        """
        Calculate VIP movement score (0-100)

        Tracks movement of heads of state / senior officials
        """
        # Filter to high-tier VIPs (tier 1 & 2 = presidents, PMs, ministers)
        vip_flights = [f for f in flights if f["is_vip"] and f["vip_tier"] <= 2]

        if not vip_flights:
            return 0.0, {"count": 0, "vips": []}

        # Count unique VIP aircraft
        unique_vips = len(set(f["icao_hex"] for f in vip_flights))

        # Base score: each VIP aircraft = 25 points
        base_score = unique_vips * 25

        # Boost for tier 1 (presidents/heads of state)
        tier1_count = sum(1 for f in vip_flights if f["vip_tier"] == 1)
        tier1_boost = tier1_count * 15

        # Boost for night flights
        night_vip_count = sum(
            1 for f in vip_flights
            if self.is_night_time(f["timestamp"], f["lat"], f["lon"])
        )
        night_boost = night_vip_count * 10

        final_score = min(100, base_score + tier1_boost + night_boost)

        vip_list = []
        for icao_hex in set(f["icao_hex"] for f in vip_flights):
            flight = next(f for f in vip_flights if f["icao_hex"] == icao_hex)
            vip_list.append({
                "country": flight["owner_country"],
                "org": flight["owner_org"],
                "tier": flight["vip_tier"]
            })

        return final_score, {"count": unique_vips, "vips": vip_list}

    def generate_narrative(self, scores: Dict, contexts: Dict) -> str:
        """Generate viral-ready narrative text"""
        parts = []

        # Convergence
        if scores["convergence"] > 60 and contexts["convergence"]:
            countries = contexts["convergence"].get("countries", [])
            flags = " ".join([self.country_flags.get(c, c) for c in countries[:5]])
            parts.append(f"{flags} jets converging")

        # Night flights
        if scores["night"] > 50 and contexts["night"]:
            count = contexts["night"]["count"]
            parts.append(f"{count} gov flights during night hours")

        # VIP movement
        if scores["vip"] > 40 and contexts["vip"]:
            count = contexts["vip"]["count"]
            parts.append(f"{count} VIP aircraft active")

        # Airlift
        if scores["airlift"] > 50 and contexts["airlift"]:
            count = contexts["airlift"]["active_aircraft"]
            parts.append(f"{count} cargo aircraft in operation")

        # Prefix based on overall score
        prefix = ""
        if scores["overall"] > 75:
            prefix = "🚨 "
        elif scores["overall"] > 50:
            prefix = "⚠️ "
        elif scores["overall"] > 25:
            prefix = "👀 "

        if not parts:
            return f"{prefix}Low activity"

        return prefix + " • ".join(parts)

    def calculate_panic_score(self, region: str = "Global", hours: int = 12) -> Dict:
        """
        Calculate composite panic score for a region

        Returns dict with overall score, component scores, and narrative
        """
        print(f"[{datetime.now(timezone.utc).isoformat()}] Calculating panic score for {region}...")

        # Get recent flight data
        flights = self.get_recent_flights(hours=hours)
        print(f"  Analyzing {len(flights)} flight records")

        if not flights:
            return {
                "region": region,
                "timestamp": datetime.now(timezone.utc),
                "overall_panic_score": 0,
                "night_flight_score": 0.0,
                "convergence_score": 0.0,
                "airlift_score": 0.0,
                "vip_movement_score": 0.0,
                "flight_count": 0,
                "countries_involved": 0,
                "top_3_airports": [],
                "narrative": "No data"
            }

        # Calculate component scores
        night_score, night_context = self.calculate_night_flight_score(flights)
        convergence_score, convergence_context = self.calculate_convergence_score(flights)
        airlift_score, airlift_context = self.calculate_airlift_score(flights)
        vip_score, vip_context = self.calculate_vip_score(flights)

        print(f"  Component scores:")
        print(f"    Night flights: {night_score:.1f}")
        print(f"    Convergence:   {convergence_score:.1f}")
        print(f"    Airlift:       {airlift_score:.1f}")
        print(f"    VIP movement:  {vip_score:.1f}")

        # Weighted composite score
        weights = {
            "night": 0.30,
            "convergence": 0.35,  # Strongest signal
            "airlift": 0.20,
            "vip": 0.15
        }

        composite = (
            night_score * weights["night"] +
            convergence_score * weights["convergence"] +
            airlift_score * weights["airlift"] +
            vip_score * weights["vip"]
        )

        overall_score = int(composite)

        # Collect metadata
        unique_countries = len(set(f["owner_country"] for f in flights))

        # Generate narrative
        scores_dict = {
            "overall": overall_score,
            "night": night_score,
            "convergence": convergence_score,
            "airlift": airlift_score,
            "vip": vip_score
        }

        contexts_dict = {
            "night": night_context,
            "convergence": convergence_context,
            "airlift": airlift_context,
            "vip": vip_context
        }

        narrative = self.generate_narrative(scores_dict, contexts_dict)

        print(f"  Overall panic score: {overall_score}/100")
        print(f"  Narrative: {narrative}")

        return {
            "region": region,
            "timestamp": datetime.now(timezone.utc),
            "overall_panic_score": overall_score,
            "night_flight_score": night_score,
            "convergence_score": convergence_score,
            "airlift_score": airlift_score,
            "vip_movement_score": vip_score,
            "flight_count": len(flights),
            "countries_involved": unique_countries,
            "top_3_airports": [],  # TODO: extract from convergence context
            "narrative": narrative
        }

    def store_panic_score(self, score_data: Dict):
        """Store panic score to database"""
        self.ch_client.execute(
            """
            INSERT INTO panic_scores
            (timestamp, region, night_flight_score, convergence_score,
             airlift_score, vip_movement_score, overall_panic_score,
             flight_count, countries_involved, top_3_airports, narrative)
            VALUES
            """,
            [{
                "timestamp": score_data["timestamp"],
                "region": score_data["region"],
                "night_flight_score": score_data["night_flight_score"],
                "convergence_score": score_data["convergence_score"],
                "airlift_score": score_data["airlift_score"],
                "vip_movement_score": score_data["vip_movement_score"],
                "overall_panic_score": score_data["overall_panic_score"],
                "flight_count": score_data["flight_count"],
                "countries_involved": score_data["countries_involved"],
                "top_3_airports": score_data["top_3_airports"],
                "narrative": score_data["narrative"]
            }]
        )

        print(f"  ✓ Stored panic score to database")

    def run_once(self):
        """Single calculation cycle"""
        score = self.calculate_panic_score(region="Global", hours=12)
        self.store_panic_score(score)
        return score

    def run_continuous(self, interval_minutes: int = 15):
        """Run continuous panic score calculation"""
        import time

        print(f"Starting panic score calculator (every {interval_minutes} minutes)")
        print("Press Ctrl+C to stop\n")

        while True:
            try:
                self.run_once()
                print(f"  Sleeping {interval_minutes} minutes until next calculation...\n")
                time.sleep(interval_minutes * 60)

            except KeyboardInterrupt:
                print("\nShutting down gracefully...")
                break
            except Exception as e:
                print(f"Error in calculation cycle: {e}")
                print("Waiting 5 minutes before retry...")
                time.sleep(300)


def main():
    """Main entry point"""
    calculator = PanicScoreCalculator()

    # Run once for testing
    score = calculator.run_once()

    print("\n" + "="*60)
    print("PANIC SCORE RESULT")
    print("="*60)
    print(f"Region: {score['region']}")
    print(f"Overall Score: {score['overall_panic_score']}/100")
    print(f"Narrative: {score['narrative']}")
    print(f"\nComponent Scores:")
    print(f"  Night Flights:  {score['night_flight_score']:.1f}/100")
    print(f"  Convergence:    {score['convergence_score']:.1f}/100")
    print(f"  Airlift:        {score['airlift_score']:.1f}/100")
    print(f"  VIP Movement:   {score['vip_movement_score']:.1f}/100")
    print(f"\nMetadata:")
    print(f"  Flight records: {score['flight_count']}")
    print(f"  Countries:      {score['countries_involved']}")
    print("="*60)

    # Uncomment to run continuously:
    # calculator.run_continuous(interval_minutes=15)


if __name__ == "__main__":
    main()
