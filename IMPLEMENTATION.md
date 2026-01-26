# Implementation Checklist

Everything you need to go from code → viral in 4 weeks.

## ✅ Phase 0: Foundation (DONE)

- [x] Database schema design
- [x] Data ingestion pipeline (OpenSky → ClickHouse)
- [x] Aircraft registry with 120+ gov/mil/VIP aircraft
- [x] Panic score calculation engine
- [x] All 4 component scores implemented
- [x] Setup scripts and documentation

**You have a working MVP core. Now we need to productionize and distribute.**

---

## Week 1: Productionize Core

### Day 1-2: Data Quality
- [ ] Run ingestion for 24h to collect baseline data
- [ ] Verify all 120 aircraft appear in live data
- [ ] Calculate activity baselines (avg flights per hour/day)
- [ ] Add more aircraft to registry (target: 200+)
  - [ ] Add more C-17s, C-130s (US airlift fleet)
  - [ ] Add more Russian gov aircraft
  - [ ] Add Chinese military transport
  - [ ] Add NATO member states (Canada, Norway, Denmark, etc.)

### Day 3-4: Timezone & Geo Fixes
- [ ] Replace rough timezone approximation with proper library (pytz)
- [ ] Add airport database (use OurAirports CSV)
- [ ] Tag airports with:
  - [ ] is_diplomatic_hub (Brussels EBBR, Geneva LSGG, Vienna LOWW, DC KIAD)
  - [ ] is_conflict_zone (Kyiv UKBB, Tel Aviv LLBG, etc.)
  - [ ] is_logistics_hub (Ramstein ETAR, Dover KDOV)
- [ ] Implement proper takeoff/landing detection
  - [ ] Detect when altitude drops and on_ground changes
  - [ ] Store to flight_events table with airport codes

### Day 5-7: Regional Scoring
- [ ] Define regions in config file:
```json
{
  "Brussels": {
    "center": [50.85, 4.35],
    "radius_km": 100,
    "importance": "high",
    "tags": ["NATO", "EU"]
  },
  "DC": {...},
  "Geneva": {...},
  "Middle East": {...},
  "Ukraine": {...}
}
```
- [ ] Modify calculate_panic.py to score per region
- [ ] Add region-specific baseline calculation
- [ ] Test: run for 24h and verify regional scores make sense

---

## Week 2: Frontend MVP

### Day 8-10: Map Interface
**Tech:** Next.js + Tailwind + Mapbox/Leaflet

- [ ] Set up Next.js project
- [ ] Implement live aircraft map
  - [ ] Fetch recent positions from ClickHouse
  - [ ] Show only gov/mil/VIP aircraft (not commercial)
  - [ ] Color-code by country/VIP tier
  - [ ] Clickable markers with aircraft details
- [ ] Add real-time updates (poll every 30s)

### Day 11-12: Score Dashboard
- [ ] Regional panic score cards
  - [ ] Big number (0-100)
  - [ ] Narrative text
  - [ ] Trend indicator (↑↓→)
  - [ ] Component score breakdown
- [ ] Historical chart (last 7 days)
- [ ] Top active aircraft list

### Day 13-14: Shareable Content
- [ ] Generate OG images for social sharing
  - [ ] Auto-generate card with score + map + narrative
  - [ ] `/og/[region].png` endpoint
- [ ] Embeddable widgets (iframe)
- [ ] Screenshot-optimized layouts (Twitter card size)

---

## Week 3: Distribution Channels

### Day 15-17: Twitter Bot
**Account:** @AirplaneSleepWatch

- [ ] Set up Twitter Developer account
- [ ] Implement bot script:
  - [ ] Hourly summary tweet (global score + top region)
  - [ ] Alert tweets when score > 60
  - [ ] Include OG image cards
  - [ ] Hashtag strategy: #OSINT #Aviation #Geopolitics
- [ ] Schedule with cron
- [ ] Example tweets:
```
🌍 Global Panic Score: 34/100 👀

Top regions:
🇧🇪 Brussels: 56/100
🇺🇸 DC: 42/100
🇨🇭 Geneva: 28/100

🚨 = >75  ⚠️ = 50-75  👀 = 25-50

[Link to dashboard]
```

### Day 18-19: Telegram Channel
**Channel:** @airplane_sleep_watch

- [ ] Create Telegram channel
- [ ] Implement bot:
  - [ ] Real-time alerts (panic > 60)
  - [ ] Regional breakdowns
  - [ ] `/score [region]` command
  - [ ] `/aircraft [icao]` lookup
- [ ] Add subscribe link to website

### Day 20-21: API + Documentation
- [ ] Simple REST API:
  - [ ] `GET /api/score/global` - current global score
  - [ ] `GET /api/score/:region` - regional score
  - [ ] `GET /api/history/:region?days=7` - historical data
  - [ ] `GET /api/aircraft/active` - currently tracked aircraft
- [ ] Add API docs page
- [ ] Implement rate limiting (free: 10/day, pro: 100/day)

---

## Week 4: Launch & Growth

### Day 22-23: Content Prep
- [ ] Write launch blog post
- [ ] Create explainer video (1-2 min)
- [ ] Prepare 10 example screenshots of interesting events
- [ ] Set up analytics (Plausible/Fathom)

### Day 24: Soft Launch
- [ ] Post to:
  - [ ] r/aviation (focus on technical/data aspect)
  - [ ] r/geopolitics (focus on insights)
  - [ ] Hacker News (focus on tech/data)
  - [ ] Twitter (personal account + new bot)
- [ ] Email to aviation/OSINT Twitter accounts
- [ ] Submit to Product Hunt (optional)

### Day 25-26: Monitor & Iterate
- [ ] Watch for first "I called it" moment
- [ ] Collect user feedback
- [ ] Fix bugs
- [ ] Add requested features quickly

### Day 27-28: Content Marketing
- [ ] Thread on "How Airplane Sleep Watch predicted [event]"
- [ ] Comparison with historical events
- [ ] Aviation spotter community outreach
- [ ] Journalist outreach (aviation, defense, OSINT reporters)

---

## Post-Launch: Ongoing

### Daily
- [ ] Monitor ingestion pipeline (uptime)
- [ ] Review panic scores for anomalies
- [ ] Engage with Twitter mentions
- [ ] Post hourly summaries (automated)

### Weekly
- [ ] Add 10-20 new aircraft to registry
- [ ] Review and label interesting events
- [ ] Content: "This week in government aviation"
- [ ] Improve baselines with new data

### Monthly
- [ ] Expand to new regions
- [ ] Improve ML/anomaly detection
- [ ] Add new data sources (ship tracking, satellites)
- [ ] Publish monthly report

---

## Monetization Setup

### Pro Tier ($9/mo)
**Tech:** Stripe + simple auth

- [ ] Set up Stripe account
- [ ] Implement simple auth (email + magic link)
- [ ] API key generation for Pro users
- [ ] Telegram bot for Pro alerts
- [ ] CSV export feature

### Enterprise ($99/mo)
- [ ] Custom region definition UI
- [ ] Webhook configuration
- [ ] White-label embed generator
- [ ] Dedicated support (email)

### Launch Timing
- Wait until 1,000+ Twitter followers
- Validate demand first
- Offer early-bird discount (50% off first month)

---

## Key Metrics to Track

### Technical Health
- [ ] Ingestion uptime %
- [ ] Data freshness (last position update)
- [ ] ClickHouse query performance
- [ ] API response times

### Growth Metrics
- [ ] Twitter followers
- [ ] Telegram subscribers
- [ ] Website visitors (unique/day)
- [ ] API requests/day

### Engagement Metrics
- [ ] Twitter engagement rate
- [ ] "I called it" moments (user-reported)
- [ ] Press mentions
- [ ] Accuracy (false positive rate)

### Revenue Metrics (post-monetization)
- [ ] Pro subscribers
- [ ] Enterprise customers
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Churn rate

---

## Technical Debt to Address

### High Priority
- [ ] Proper error handling in ingestion (email alerts on failure)
- [ ] Database backups (daily to S3)
- [ ] Monitoring/alerting (UptimeRobot + Sentry)
- [ ] Rate limit OpenSky calls properly
- [ ] Handle API downtime gracefully

### Medium Priority
- [ ] Optimize ClickHouse queries (add indexes)
- [ ] Add caching layer (Redis) for API
- [ ] Implement proper logging (structured logs)
- [ ] Add unit tests for panic score calculation

### Low Priority
- [ ] Switch to ADS-B Exchange for better coverage
- [ ] Run own ADS-B receivers for redundancy
- [ ] Add ML model for baseline prediction
- [ ] Implement proper authentication/authorization

---

## Risk Mitigation

### Risk: OpenSky rate limiting
**Mitigation:**
- Use authenticated account (400/day)
- Increase poll interval to 30s if needed
- Budget for ADS-B Exchange paid tier ($30/mo)

### Risk: Someone copies the idea
**Mitigation:**
- Move FAST (ship in 4 weeks)
- Build brand/following early
- Network effects (more users = better baselines)

### Risk: False alarms hurt credibility
**Mitigation:**
- Show component scores (transparency)
- Add confidence intervals
- Label historical events to calibrate
- User feedback loop

### Risk: Data source blocked
**Mitigation:**
- OpenSky + ADS-B Exchange dual sourcing
- Run own receivers in key locations
- Partner with aviation spotter community

---

## Success Criteria

### Week 4 (Launch)
- [ ] 500+ Twitter followers
- [ ] 100+ Telegram subscribers
- [ ] 1 "I called it" moment
- [ ] 0 downtime

### Month 2
- [ ] 5,000+ Twitter followers
- [ ] 500+ Telegram subscribers
- [ ] 3+ press mentions
- [ ] 10+ Pro subscribers ($90 MRR)

### Month 6
- [ ] 50,000+ Twitter followers
- [ ] 5,000+ Telegram subscribers
- [ ] Used by journalists regularly
- [ ] 200+ Pro, 10+ Enterprise
- [ ] $3,000+ MRR

### Year 1
- [ ] 200,000+ Twitter followers
- [ ] Industry standard for gov aircraft tracking
- [ ] 1,000+ Pro, 50+ Enterprise
- [ ] $15,000+ MRR
- [ ] Raised seed round or profitable

---

## Resources Needed

### Immediate
- [ ] Domain name (airplanesleep.watch or similar) - $12/yr
- [ ] ClickHouse hosting (DigitalOcean $20/mo or AWS)
- [ ] OpenSky account (free, but upgrade if needed)

### Month 2
- [ ] Frontend hosting (Vercel free tier works)
- [ ] ADS-B Exchange API ($30/mo if needed)
- [ ] Error tracking (Sentry free tier)

### Month 3+
- [ ] Better infrastructure (load balancer, etc.)
- [ ] CDN for images (Cloudflare free tier)
- [ ] Email service (SendGrid free tier)

**Total initial cost: ~$50/mo**

---

## The Bottom Line

You have a **working core** that solves the hard parts:
- Data ingestion ✓
- Aircraft curation ✓
- Panic score algorithm ✓

Now you need **distribution** (frontend, bots, API) and **content** (launch posts, threads, engagement).

**Timeline:** 4 weeks to launch if you move fast.

**Critical path:**
1. Week 1: Fix timezone/geo bugs, add more aircraft
2. Week 2: Ship basic frontend
3. Week 3: Launch Twitter bot
4. Week 4: Public launch

The idea is **too good** to sit on. Pentagon Pizza proved the concept. This is 10x better.

**Ship now. Iterate fast. Let the internet tell you what to build next.**
