# ✈️ Airplane Sleep Watch

**Track unusual government/military aircraft movements. Know when something big is about to happen.**

Inspired by Pentagon Pizza Watch ($1M+ valuation), but 10x better signal-to-noise.

![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![Aircraft](https://img.shields.io/badge/aircraft-186%20tracked-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 The Concept

Pentagon Pizza Watch tracked pizza deliveries during odd hours as a proxy for "big news incoming." It went viral.

**Airplane Sleep Watch does this concept way better:**

Instead of tracking pizza, we track:
- Air Force One, presidential aircraft
- E-4B "Doomsday planes" (nuclear command)
- NATO leader transport
- Strategic airlift (C-17, A400M, Il-76)
- VIP government aircraft globally

**Panic Score Algorithm** analyzes:
1. **Night flights** (00:00-06:00 local time activity)
2. **Convergence** (multiple countries → same airport)
3. **Airlift activity** (cargo flights to conflict zones)
4. **VIP movements** (presidents, PMs, foreign ministers)

**Output:** Viral-ready scores like:
```
🚨 Brussels: 82/100

🇺🇸 🇬🇧 🇫🇷 🇩🇪 jets converging at 03:40
4 VIP aircraft • 12 night flights

airplanesleep.watch
```

---

## 🚀 What We Built

### ✅ Backend (Python + ClickHouse)
- **Data ingestion:** OpenSky Network → ClickHouse (every 10s)
- **Aircraft registry:** 186 curated gov/mil/VIP aircraft
- **Panic calculator:** 4-component algorithm producing 0-100 scores
- **Countries tracked:** US, UK, France, Germany, Russia, China, +15 more

### ✅ Frontend (Next.js + React)
- **Live map:** Real-time aircraft positions (Leaflet)
- **Panic dashboard:** Visual score cards with narratives
- **Historical charts:** Trend analysis (Recharts)
- **Active aircraft list:** Detailed table of tracked flights
- **Dark theme:** Optimized for OSINT work
- **Auto-refresh:** 30s updates

---

## 📁 Project Structure

```
airplane-sleep-watch/
├── README_FINAL.md              ← You are here
├── LAUNCH_CHECKLIST.md          ← 30-min launch guide
├── PROJECT_OVERVIEW.md          ← Full strategy & roadmap
├── IMPLEMENTATION.md            ← 4-week detailed plan
├── Makefile                     ← Quick commands
├── docker-compose.yml           ← ClickHouse setup
│
├── src/                         ← Backend (Python)
│   ├── db_schema.sql
│   ├── ingest_opensky.py        ← Data pipeline
│   └── calculate_panic.py       ← Panic score engine
│
├── data/
│   └── aircraft_profiles.csv    ← 186 tracked aircraft
│
├── scripts/
│   ├── setup_db.py
│   ├── seed_aircraft.py
│   └── test_setup.py
│
└── frontend/                    ← Next.js app
    ├── app/
    │   ├── page.tsx             ← Main dashboard
    │   └── api/                 ← ClickHouse API routes
    └── components/
        ├── AircraftMap.tsx      ← Live map
        ├── PanicScoreCard.tsx   ← Score display
        ├── HistoricalChart.tsx  ← Trends
        └── ActiveAircraftList.tsx
```

---

## ⚡ Quick Start (10 Minutes)

### Prerequisites
- Python 3.8+
- Docker (for ClickHouse)
- Node.js 18+ or Bun (for frontend)

### Backend Setup

```bash
cd airplane-sleep-watch

# 1. Start ClickHouse
docker-compose up -d

# 2. Install Python dependencies
pip3 install -r requirements.txt

# 3. Setup database
python3 scripts/setup_db.py
python3 scripts/seed_aircraft.py

# 4. Start ingestion
python3 src/ingest_opensky.py
```

Wait 10 minutes for data collection, then:

```bash
# 5. Calculate panic score
python3 src/calculate_panic.py
```

You'll see:
```
Region: Global
Overall Score: 28/100
Narrative: ⚠️ 🇺🇸 🇬🇧 🇫🇷 jets converging • 2 VIP aircraft active
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install  # or: bun install

# Configure
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Open **http://localhost:3000**

---

## 🎨 Screenshots

### Main Dashboard
- Global panic score hero card
- Live aircraft map with tracked positions
- Component score breakdown
- Historical trend chart

### Regional Scores
- Brussels, DC, Geneva, Middle East, etc.
- Per-region panic scores and narratives
- Active aircraft by region

### Aircraft Details
- Real-time position tracking
- VIP tier indicators
- Operator and aircraft type
- Speed, altitude, heading

---

## 🧠 How It Works

### 1. Data Collection
```
OpenSky API → Filter 186 aircraft → ClickHouse
         ↓
Every 10 seconds, store positions
```

### 2. Panic Score Calculation (Every 15min)
```python
# Night Flight Score (30%)
night_score = unusual_night_activity * vip_weight * country_multiplier

# Convergence Score (35%) - STRONGEST SIGNAL
convergence_score = countries_at_same_location ** 1.5 * vip_boost

# Airlift Score (20%)
airlift_score = active_cargo_missions * military_ratio

# VIP Movement Score (15%)
vip_score = tier1_aircraft * 25 + night_vip_boost

# Composite
panic_score = weighted_average(all_scores)
```

### 3. Frontend Display
```
API routes → ClickHouse queries → JSON → React components
         ↓
Auto-refresh every 30s
```

---

## 📊 Tracked Aircraft

### By Category
- **US Presidential:** 2 VC-25A (Air Force One), 4 E-4B (Doomsday planes)
- **US VIP:** 13 C-40B/C, 12 C-37A/B Gulfstreams
- **US Strategic:** 62 C-17 Globemasters
- **US Tactical:** 20 C-130 Hercules
- **NATO Leaders:** UK PM, French President, German Chancellor fleets
- **Russian:** Il-96 presidential, Il-76 cargo fleet
- **Chinese:** Presidential 747-8, VIP transport
- **Middle East:** Saudi Royal Family, UAE, Israeli, Qatari gov aircraft

### By Country
- 🇺🇸 US: 105 aircraft
- 🇬🇧 UK: 30 aircraft
- 🇫🇷 France: 12 aircraft
- 🇩🇪 Germany: 11 aircraft
- 🇷🇺 Russia: 8 aircraft
- +15 more countries

**Total: 186 aircraft tracked**

---

## 🎯 Why This Will Go Viral

1. **Screenshotable** - Perfect for Twitter/Reddit
   - "🚨 Brussels: 82/100 - 🇺🇸 🇬🇧 🇫🇷 🇩🇪 jets converging at 03:40"

2. **Predictive Clout** - Spot events before news breaks
   - "I saw this spike 8 hours before it was announced"

3. **Gamification** - Track scores like sports
   - "Brussels higher than DC this week"

4. **News Value** - Journalists will use as tips
   - Pentagon Pizza got press citations

5. **Conspiracy-Adjacent** - Data-driven but pulls that audience
   - "Just showing the data..."

---

## 🚀 Launch Strategy

### Week 1: Soft Launch
- [ ] Deploy frontend (Vercel)
- [ ] Post on Reddit (r/geopolitics, r/aviation, r/OSINT)
- [ ] Post on Twitter (your account)
- [ ] Submit to Hacker News
- [ ] Email aviation/OSINT accounts

### Week 2-3: Growth
- [ ] Launch Twitter bot (@AirplaneSleepWatch)
- [ ] Launch Telegram channel
- [ ] First "I called it" viral moment
- [ ] Press outreach

### Month 2-3: Monetize
- [ ] Pro tier ($9/mo): Real-time, all regions, alerts, API
- [ ] Enterprise ($99/mo): Unlimited API, webhooks, white-label
- [ ] Target: $2,000-5,000 MRR

---

## 📈 Success Metrics

### Week 1
- 500+ Twitter followers
- 100+ Telegram subscribers
- 5,000+ website visitors
- 1+ "I called it" moment

### Month 3
- 25,000+ Twitter followers
- 50+ Pro subscribers ($450 MRR)
- 10+ Enterprise ($990 MRR)
- Used by journalists
- **Total: ~$1,500 MRR**

### Month 6
- 100,000+ Twitter followers
- 200+ Pro, 20+ Enterprise
- **$3,000+ MRR**
- Seed funding or profitable

---

## 🔧 Next Features

### Immediate (Week 1-2)
- [ ] Add 100+ more aircraft (target: 300+)
- [ ] Regional scoring (Brussels, DC, Geneva)
- [ ] Twitter bot (hourly summaries + alerts)
- [ ] Telegram bot

### Short-term (Month 1-2)
- [ ] Proper timezone handling
- [ ] Takeoff/landing detection
- [ ] Airport database with tags
- [ ] Activity baselines (90-day rolling)

### Medium-term (Month 2-3)
- [ ] Historical event correlation
- [ ] Predictive ML models
- [ ] Ship tracking integration
- [ ] Satellite imagery correlation

---

## 💡 Content Ideas

### Daily Tweets
```
🌍 24h Panic Score Update

Global: 34/100 👀

Top regions:
🇧🇪 Brussels: 56/100
🇺🇸 DC: 42/100
🇨🇭 Geneva: 28/100

45 tracked aircraft
8 countries active

[screenshot]
airplanesleep.watch
```

### Viral Moments
```
🚨 CAUGHT THIS 8 HOURS EARLY

Brussels panic score: 89/100
5 NATO leaders converged at 02:30

[before/after screenshots]

This preceded [major announcement] by 8 hours.

airplanesleep.watch tracks gov aircraft 24/7
```

---

## 🛠️ Tech Stack

**Backend:**
- Python 3.8+
- ClickHouse (time-series DB)
- OpenSky Network API
- Docker

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Leaflet (maps)
- Recharts (charts)

**Deployment:**
- Frontend: Vercel / Docker
- Backend: VPS / AWS
- Database: ClickHouse Cloud / Self-hosted

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 10-minute setup guide
- **[LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)** - 30-minute launch guide
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Full concept & strategy
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - 4-week detailed roadmap
- **[frontend/README.md](frontend/README.md)** - Frontend documentation

---

## 🤝 Contributing

This is a personal project for now, but ideas/feedback welcome:
- Open issues for bugs/features
- Tag me on Twitter with suggestions
- Email for serious inquiries

---

## ⚖️ Legal & Ethics

**Is this legal?**
Yes. All data comes from publicly broadcast ADS-B signals. Aircraft broadcast their position openly. We're just aggregating it.

**Precedents:**
- FlightRadar24 (valued at $1B+)
- ADS-B Exchange
- Pentagon Pizza Watch

**Ethics:**
- We track *aircraft*, not people
- All data is public domain
- Used for informational/educational purposes
- Can help journalists spot stories

---

## 📄 License

MIT License - see LICENSE file

---

## 🎉 Ready to Launch

You have:
- ✅ Working backend (ingestion + panic calculator)
- ✅ Working frontend (map + dashboard + charts)
- ✅ 186 tracked aircraft across 20+ countries
- ✅ Proven concept (Pentagon Pizza)
- ✅ Perfect timing (geopolitical tensions high)

**What's left:**
1. Deploy it (30 minutes)
2. Tell people about it (1 day)
3. Iterate based on feedback (ongoing)

**The hard part is done. Now go make it viral.** 🚀

---

**Built by:** [Your Name/Handle]
**Twitter:** @AirplaneSleepWatch (claim this!)
**GitHub:** github.com/yourusername/airplane-sleep-watch
**Website:** airplanesleep.watch (register this!)

*Track government aircraft. Know what's happening before the news does.*
