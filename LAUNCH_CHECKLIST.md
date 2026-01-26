# Launch Checklist - Airplane Sleep Watch

You now have a **fully functional MVP**. Here's how to launch it.

## ✅ What You Have

### Backend (Complete)
- [x] ClickHouse database schema
- [x] Data ingestion pipeline (OpenSky → ClickHouse)
- [x] **186 tracked aircraft** (US, NATO, Russia, China, Middle East)
- [x] Panic score calculation engine with 4 component scores
- [x] Database setup and seed scripts

### Frontend (Complete)
- [x] Next.js app with dark theme
- [x] Live aircraft map with Leaflet
- [x] Real-time panic score dashboard
- [x] Historical trend charts
- [x] Active aircraft list
- [x] API routes connecting to ClickHouse
- [x] Responsive design

---

## 🚀 Launch Steps (30 Minutes)

### Step 1: Test Locally (10 min)

```bash
cd ~/airplane-sleep-watch

# 1. Start ClickHouse
docker-compose up -d

# 2. Setup database
python3 scripts/setup_db.py
python3 scripts/seed_aircraft.py

# 3. Start ingestion (separate terminal)
python3 src/ingest_opensky.py

# 4. Wait 10 minutes for data collection

# 5. Calculate panic score (separate terminal)
python3 src/calculate_panic.py

# 6. Start frontend (separate terminal)
cd frontend
npm install  # or bun install
cp .env.local.example .env.local
npm run dev

# 7. Open http://localhost:3000
```

**Expected result:**
- Map shows tracked aircraft (if any are currently flying)
- Panic score card shows Global score
- Active aircraft list shows recent aircraft

### Step 2: Deploy Frontend (10 min)

#### Option A: Vercel (Easiest)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - CLICKHOUSE_URL (your public ClickHouse URL)
# - CLICKHOUSE_DB=airplane_watch
```

**Important:** Your ClickHouse needs to be accessible from the internet. Options:
1. Deploy ClickHouse to cloud (DigitalOcean, AWS, etc.)
2. Use ClickHouse Cloud (paid)
3. Expose local ClickHouse with ngrok/tunneling (not recommended for production)

#### Option B: Docker

```bash
cd frontend

# Build
docker build -t airplane-sleep-watch-frontend .

# Run
docker run -p 3000:3000 \
  -e CLICKHOUSE_URL=http://your-server:8123 \
  -e CLICKHOUSE_DB=airplane_watch \
  airplane-sleep-watch-frontend
```

### Step 3: Set Up Continuous Running (10 min)

Create systemd services or use `screen`/`tmux`:

```bash
# Screen approach (quick & dirty)
screen -S ingest
cd ~/airplane-sleep-watch
python3 src/ingest_opensky.py
# Ctrl+A, D to detach

screen -S panic
cd ~/airplane-sleep-watch
# Edit src/calculate_panic.py to uncomment continuous mode
python3 src/calculate_panic.py
# Ctrl+A, D to detach

# List screens
screen -ls

# Reattach
screen -r ingest
```

---

## 📱 Social Media Setup

### Twitter Bot

1. **Create account:** @AirplaneSleepWatch
2. **Apply for API access:** developer.twitter.com
3. **Create bot script** (save as `scripts/twitter_bot.py`):

```python
# Will provide this next if you want it
```

### Telegram Channel

1. **Create channel:** @airplane_sleep_watch
2. **Get bot token:** Talk to @BotFather
3. **Create bot script** (save as `scripts/telegram_bot.py`)

---

## 🎯 Launch Day Strategy

### Pre-Launch (Day -1)
- [ ] Test everything works end-to-end
- [ ] Prepare 5 interesting screenshots
- [ ] Write launch thread/post
- [ ] Set up analytics (Plausible/Fathom)

### Launch Day

**Morning:**
1. Post on Twitter (your personal account):
   ```
   I built Airplane Sleep Watch 🛩️

   Track unusual gov/military aircraft movements globally.
   Real-time "panic scores" that signal when something big is happening.

   Like Pentagon Pizza but 10x better signal-to-noise.

   [link] [screenshot]
   ```

2. Post on Reddit:
   - r/geopolitics (focus on insights)
   - r/aviation (focus on tracking tech)
   - r/OSINT (focus on methodology)

3. Hacker News:
   - Title: "Airplane Sleep Watch – Track unusual government aircraft movements"
   - URL: your deployed site

**Afternoon:**
4. Email aviation/OSINT Twitter accounts
5. Submit to Product Hunt (optional)

**Evening:**
6. Engage with comments/feedback
7. Make quick improvements based on feedback

---

## 🎨 Content Ideas for First Week

### Daily Posts (Twitter)

**Format:**
```
🌍 24-Hour Panic Score Update

Global: 34/100 👀

Top regions:
🇧🇪 Brussels: 56/100
🇺🇸 DC: 42/100

45 tracked aircraft
8 countries active

[screenshot with map]

airplanesleep.watch
```

### First Viral Moment

Watch for:
- High panic score (>70) before major news
- Unusual convergence (5+ countries to one airport)
- VIP movement at odd hours

When it happens:
1. Screenshot immediately
2. Tweet: "🚨 Caught this spike 8 hours before [event] was announced"
3. Include timestamp evidence
4. Tag relevant journalists/accounts

---

## 🔧 Quick Improvements

### Week 1 Priorities

1. **Add more aircraft** (current: 186, target: 300+)
   - More C-17s, C-130s
   - Add Japanese, Indian gov aircraft
   - Add more European VIP aircraft

2. **Regional scoring**
   - Define Brussels, DC, Geneva, Middle East regions
   - Calculate per-region panic scores

3. **Improve timezone detection**
   - Replace rough approximation with proper library
   - Add airport database

4. **Add Twitter bot**
   - Hourly summaries
   - Alerts for panic > 60

### Week 2-3

5. **Takeoff/landing detection**
   - Parse flight_events properly
   - Better airport context

6. **Activity baselines**
   - Calculate rolling 90-day baselines
   - Improve anomaly detection

7. **Historical correlation**
   - Label known events
   - Show "Highest since [event]"

---

## 📊 Success Metrics

### Week 1
- [ ] 500+ Twitter followers
- [ ] 100+ Telegram subscribers
- [ ] 1+ "I called it" moment
- [ ] 5,000+ website visitors

### Month 1
- [ ] 5,000+ Twitter followers
- [ ] 500+ Telegram subscribers
- [ ] 3+ press mentions
- [ ] 50,000+ website visitors

### Month 3
- [ ] 25,000+ Twitter followers
- [ ] Ready to launch Pro tier ($9/mo)
- [ ] Used by journalists
- [ ] Profitable or raising

---

## 🚨 Common Issues & Fixes

### No aircraft showing on map
- Wait 10-15 minutes after starting ingestion
- Check if any tracked aircraft are flying: `SELECT count() FROM flight_positions WHERE timestamp >= now() - INTERVAL 1 HOUR`
- Most government flights happen during business hours (0800-1800 local)

### Panic score always 0
- Need at least 2-3 hours of data for baselines
- Some component scores require specific conditions (night flights, convergence)
- Check raw data: `SELECT count() FROM flight_positions`

### Frontend can't connect to ClickHouse
- Make sure ClickHouse HTTP port (8123) is accessible
- Check firewall rules
- Try: `curl http://localhost:8123/ping`

### OpenSky rate limiting
- Free tier: 400 requests/day (authenticated)
- That's ~8 hours at 10s poll interval
- Solution: Register account, add credentials to `.env`
- Or: Increase `POLL_INTERVAL` to 30s

---

## 💰 Monetization Prep (Month 2+)

### Free Tier (Always)
- 24h delayed panic scores
- Global score only
- Basic map
- 10 API requests/day

### Pro Tier ($9/mo)
- Real-time scores (no delay)
- All regions
- Historical data export (CSV)
- 100 API requests/day
- Telegram alerts
- Email alerts

### Enterprise ($99/mo)
- Unlimited API
- Custom regions
- Webhooks
- White-label embeds
- Priority support

**Implementation:**
- Use Stripe for payments
- Simple auth (email + magic link)
- API keys for Pro users

---

## 🎉 You're Ready!

Everything is built. Now you just need to:
1. Deploy it
2. Tell people about it
3. Iterate based on feedback

**The hardest part is done.** The idea is proven (Pentagon Pizza). Your execution is better. The timing is perfect (geopolitical tensions high).

**Move fast and ship.**

Good luck! 🚀
