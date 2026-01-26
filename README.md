# Airplane Sleep Watch

Track unusual government/military/VIP aircraft movements and detect when something big is about to happen.

Inspired by Pentagon Pizza Watch, but better.

## Concept

Monitor global aircraft activity for anomalies that signal major geopolitical events:
- Government jets converging on diplomatic hubs at 3am
- Repeated military cargo flights to conflict zones
- VIP aircraft movements during weekends/holidays
- Unusual patterns that preceded invasions, summits, crises

## Architecture

**Data Pipeline:**
1. Poll OpenSky Network API every 10s for aircraft positions
2. Filter to only gov/mil/VIP aircraft (from curated `aircraft_profiles` table)
3. Store positions in ClickHouse time-series DB
4. Detect takeoff/landing events with geo/time context
5. Calculate "Panic Score" (0-100) per region every 15min

**Panic Score Components:**
- Night Flight Anomaly (00:00-06:00 local time activity)
- Convergence Score (multiple countries → same airport)
- Silent Airlift Index (repeated cargo flights)
- VIP Movement Score (heads of state / ministers)

## Setup

### Prerequisites

- Python 3.8+
- ClickHouse server (local or remote)
- OpenSky Network account (optional but recommended for higher rate limits)

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env

# Edit .env with your credentials
# nano .env

# Set up database schema
python scripts/setup_db.py

# Populate aircraft registry (see step 2 below)
python scripts/seed_aircraft.py

# Start ingestion
python src/ingest_opensky.py
```

### ClickHouse Setup

**Option 1: Docker (easiest)**
```bash
docker run -d \
  --name clickhouse \
  -p 9000:9000 \
  -p 8123:8123 \
  clickhouse/clickhouse-server
```

**Option 2: Install locally**
```bash
# macOS
brew install clickhouse

# Ubuntu/Debian
sudo apt-get install clickhouse-server clickhouse-client

# Start server
clickhouse-server
```

### OpenSky Network API

- Free tier: 100 requests/day (anonymous) or 400/day (registered)
- Registered accounts get priority access
- Sign up: https://opensky-network.org/

Rate limits with free tier:
- Poll every 10s = ~8,640 requests/day (need registered account)
- Consider polling every 30s initially

## Project Structure

```
airplane-sleep-watch/
├── src/
│   ├── ingest_opensky.py      # OpenSky API poller → ClickHouse
│   ├── db_schema.sql           # Database schema
│   ├── detect_events.py        # Takeoff/landing detection (TODO)
│   ├── calculate_panic.py      # Panic score engine (TODO)
│   └── api.py                  # REST API for frontend (TODO)
├── scripts/
│   ├── setup_db.py             # Database setup
│   └── seed_aircraft.py        # Seed aircraft_profiles (TODO)
├── data/
│   └── aircraft_profiles.csv   # Curated gov/mil/VIP aircraft list
├── config/
│   └── regions.json            # Region definitions (TODO)
├── requirements.txt
├── .env.example
└── README.md
```

## Data Flow

```
OpenSky API
    ↓ (every 10s)
ingest_opensky.py
    ↓
ClickHouse: flight_positions (raw stream)
    ↓ (batch processing)
detect_events.py
    ↓
ClickHouse: flight_events (takeoff/landing)
    ↓ (every 15min)
calculate_panic.py
    ↓
ClickHouse: panic_scores
    ↓
Frontend / API / Alerts
```

## Next Steps

### Phase 1: Core Infrastructure ✓
- [x] Database schema
- [x] OpenSky ingestion pipeline
- [ ] Aircraft profiles seed data
- [ ] Event detection (takeoff/landing)

### Phase 2: Scoring Engine
- [ ] Baseline calculation
- [ ] Night flight score
- [ ] Convergence score
- [ ] Airlift score
- [ ] VIP movement score
- [ ] Composite panic score

### Phase 3: Frontend
- [ ] Live aircraft map
- [ ] Regional panic score cards
- [ ] Historical charts
- [ ] Shareable embeds

### Phase 4: Distribution
- [ ] Telegram bot
- [ ] Twitter bot
- [ ] Discord webhook
- [ ] API for third parties

## Notes

**Why this will go viral:**
1. Screenshotable panic scores ("🚨 Brussels: 82/100")
2. Predictive clout (spot spikes before news breaks)
3. Gamification (track regions like sports scores)
4. News value (journalists will use as tips)
5. Conspiracy-adjacent but data-driven

**Monetization:**
- Free: 24h delayed data
- Pro ($9/mo): Real-time alerts, all regions, API
- Enterprise ($99/mo): Unlimited API, webhooks, white-label

**Keys to success:**
- Move FAST (someone else will do this)
- Start with US/UK/France/Russia/China aircraft
- Focus on NATO regions first (Brussels, DC, Geneva)
- Make panic scores extremely shareable
- Don't overthink v1 - ship and iterate

## License

MIT
