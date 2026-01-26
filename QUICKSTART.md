# Quick Start Guide

Get Airplane Sleep Watch running in 10 minutes.

## Prerequisites

1. **ClickHouse** - install via Docker (easiest):
```bash
docker run -d \
  --name clickhouse \
  -p 9000:9000 \
  -p 8123:8123 \
  clickhouse/clickhouse-server
```

2. **Python 3.8+**
```bash
python3 --version
```

## Installation

```bash
# 1. Clone/navigate to project
cd airplane-sleep-watch

# 2. Install Python dependencies
pip3 install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# Edit .env if needed (defaults work with Docker ClickHouse)
# nano .env
```

## Database Setup

```bash
# Create database and tables
python3 scripts/setup_db.py

# Load aircraft registry (120+ gov/mil/VIP aircraft)
python3 scripts/seed_aircraft.py
```

You should see output like:
```
Loading 120 aircraft profiles...
  ✓ Loaded 120 aircraft profiles

Summary by country:
  Country    Total    VIP      Military
  ----------------------------------------
  US         50       15       45
  GB         15       8        14
  RU         12       6        12
  ...
```

## Start Tracking

```bash
# Terminal 1: Start ingestion pipeline
python3 src/ingest_opensky.py
```

This will poll OpenSky API every 10 seconds and store gov/mil/VIP aircraft positions.

**Wait 5-10 minutes** to collect some data, then:

```bash
# Terminal 2: Calculate panic score (one-time)
python3 src/calculate_panic.py
```

You'll see output like:
```
[2026-01-17T...] Calculating panic score for Global...
  Analyzing 145 flight records
  Component scores:
    Night flights: 12.3
    Convergence:   45.6
    Airlift:       8.2
    VIP movement:  23.1
  Overall panic score: 28/100
  Narrative: ⚠️ 🇺🇸 🇬🇧 🇫🇷 jets converging • 2 VIP aircraft active

============================================================
PANIC SCORE RESULT
============================================================
Region: Global
Overall Score: 28/100
Narrative: ⚠️ 🇺🇸 🇬🇧 🇫🇷 jets converging • 2 VIP aircraft active
...
```

## Next Steps

### Run Continuously

Modify `src/calculate_panic.py` to run the continuous scheduler:

```python
if __name__ == "__main__":
    calculator = PanicScoreCalculator()
    calculator.run_continuous(interval_minutes=15)  # Uncomment this
```

### Query Historical Data

```bash
# Connect to ClickHouse
clickhouse-client

# Or via Docker:
docker exec -it clickhouse clickhouse-client
```

```sql
-- View latest panic scores
SELECT
    timestamp,
    region,
    overall_panic_score,
    narrative
FROM panic_scores
ORDER BY timestamp DESC
LIMIT 10;

-- View tracked aircraft positions
SELECT
    icao_hex,
    callsign,
    count() as position_count,
    max(timestamp) as last_seen
FROM flight_positions
GROUP BY icao_hex, callsign
ORDER BY position_count DESC
LIMIT 20;

-- Countries currently active
SELECT
    ap.owner_country,
    count(DISTINCT fp.icao_hex) as active_aircraft,
    max(fp.timestamp) as last_activity
FROM flight_positions fp
JOIN aircraft_profiles ap ON fp.icao_hex = ap.icao_hex
WHERE fp.timestamp >= now() - INTERVAL 1 HOUR
GROUP BY ap.owner_country
ORDER BY active_aircraft DESC;
```

## Troubleshooting

### No data being stored?

Check OpenSky API is returning data:
```bash
curl "https://opensky-network.org/api/states/all"
```

### ClickHouse connection errors?

Verify ClickHouse is running:
```bash
docker ps | grep clickhouse

# Or if installed locally:
clickhouse-client --query "SELECT 1"
```

### Rate limiting?

OpenSky free tier limits:
- Anonymous: 100 requests/day (~14 hours at 10s interval)
- Registered: 400 requests/day (~55 hours)

**Solution:** Create free account at opensky-network.org and add credentials to `.env`:
```
OPENSKY_USERNAME=your_email
OPENSKY_PASSWORD=your_password
```

Or increase `POLL_INTERVAL` in `.env`:
```
POLL_INTERVAL=30  # Poll every 30s instead of 10s
```

## Understanding the Scores

**Overall Panic Score (0-100):**
- 0-25: Normal activity
- 26-50: Elevated activity (worth watching)
- 51-75: Unusual activity (likely newsworthy)
- 76-100: Extreme activity (major event imminent/ongoing)

**Component Scores:**
- **Night Flights**: Gov/mil aircraft active 00:00-06:00 local time
- **Convergence**: Multiple countries' aircraft in same area
- **Airlift**: Cargo aircraft (C-17, A400M, etc.) activity
- **VIP Movement**: Presidents, PMs, ministers traveling

**Narratives:**
Auto-generated summaries like:
- `🚨 🇺🇸 🇬🇧 🇫🇷 🇩🇪 jets converging • 4 VIP aircraft active`
- `⚠️ 12 gov flights during night hours • 3 cargo aircraft in operation`
- `👀 2 VIP aircraft active`

## What's Next?

1. **Add more aircraft** - Expand `data/aircraft_profiles.csv` with more gov/mil aircraft
2. **Regional scoring** - Modify calculator to track specific regions (Europe, Middle East, etc.)
3. **Event detection** - Build proper takeoff/landing parser (currently using raw positions)
4. **Alerts** - Add Telegram/Discord bots for high panic scores
5. **Frontend** - Build web interface with live map + scores
6. **API** - Expose REST API for third parties

## Production Checklist

Before going live:

- [ ] Set up proper timezone handling (currently uses rough approximation)
- [ ] Implement takeoff/landing detection (currently analyzes raw positions)
- [ ] Add airport database with diplomatic hub / conflict zone tags
- [ ] Calculate activity baselines for anomaly detection
- [ ] Set up monitoring/alerts for pipeline failures
- [ ] Add more aircraft to registry (currently ~120, target 500+)
- [ ] Implement regional scoring (Brussels, DC, Middle East, etc.)
- [ ] Build frontend
- [ ] Set up backups for ClickHouse data

---

**Remember:** Move FAST. This idea is too good to sit on. Ship MVP, iterate based on viral feedback.
