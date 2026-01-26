# Aircraft Database Expansion Targets

Based on comprehensive research, here's what we can add to reach 400-500+ tracked aircraft.

## Current Status
- **Current:** 186 aircraft
- **Target:** 400-500 aircraft
- **Gap:** 214-314 aircraft needed

---

## 🎯 Priority 1: US Military (Easiest - All ICAO Codes Available)

### Tankers (Strategic Deployment Indicator) - ADD 150
- **KC-135 Stratotanker:** 396 in service
  - Pattern: AE04xx - AE07xx
  - Add 100 aircraft
- **KC-46 Pegasus:** 89 delivered
  - Pattern: AE63xx
  - Add 30 aircraft
- **KC-10 Extender:** 20 remaining (recently retired)
  - Pattern: AE02xx
  - Add 20 aircraft

### ISR/Intelligence (High Value) - ADD 100
- **P-8 Poseidon:** 130+ in service (we have 12)
  - Pattern: AE22xx, AE4Exx
  - Add 88 more aircraft
- **RC-135 variants:** 22 aircraft
  - Add 12 aircraft

### Transport (Deployment Indicator) - ADD 50
- **C-130 Hercules:** 400+ in service (we have 20)
  - Add 30 more (most active bases)
- **C-17 Globemaster:** 222 total (we have some)
  - Add 20 more

### Bombers (Escalation Indicator) - ADD 20
- **B-52 Stratofortress:** 76 aircraft
  - Add 10 aircraft
- **B-1 Lancer:** 45 aircraft
  - Add 5 aircraft
- **B-2 Spirit:** 20 aircraft
  - Add 5 aircraft (if trackable)

**Priority 1 Total: +320 aircraft** (US military only)

---

## 🎯 Priority 2: African Leaders (HIGH VIRAL POTENTIAL) - ADD 10

These are extremely viral when they move (coups, summits, crises):

- **South Africa:** ZS-RSA (00AEC9) ✅ Ready to add
- **Nigeria:** 5N-FGA (4241AC) ✅ Ready to add
- **Kenya:** KAF308 (04C030) ✅ Ready to add
- **Egypt:** Presidential 737
- **Ethiopia:** PM aircraft
- **Ghana:** Presidential aircraft
- **Senegal:** Presidential aircraft
- **Rwanda:** Presidential aircraft
- **Tanzania:** Presidential aircraft
- **Uganda:** Presidential aircraft

---

## 🎯 Priority 3: South America Leaders - ADD 8

- **Argentina:** ARG-01 (E200DD) ✅ Ready to add
- **Brazil:** FAB2101 (need hex)
- **Chile:** FACH 985 (need hex)
- **Colombia:** FAC0001 (have 1, add more)
- **Peru:** Presidential aircraft
- **Venezuela:** Presidential aircraft
- **Ecuador:** Presidential aircraft
- **Bolivia:** Presidential aircraft

---

## 🎯 Priority 4: Asia-Pacific Gov - ADD 20

### High Priority
- **Singapore:** Government aircraft (718000-71FFFF range)
- **Thailand:** Royal Thai AF VIP fleet
- **Malaysia:** Government aircraft
- **Indonesia:** Presidential aircraft
- **Vietnam:** Government aircraft
- **Pakistan:** PM aircraft
- **Bangladesh:** PM aircraft

### Medium Priority
- **Philippines:** Presidential aircraft
- **Myanmar:** Military government aircraft
- **New Zealand:** Government aircraft

---

## 🎯 Priority 5: Middle East (Additional) - ADD 15

- **Saudi Arabia:** More royal family aircraft (100+ fleet)
  - HZ-HM1, HZ-HM1A, HZ-HM1B
  - HZ-MF7, HZ-MF8 (Crown Prince 787s)
- **Jordan:** King's aircraft (740000-747FFF range)
- **Oman:** Sultan's aircraft
- **Bahrain:** Royal family aircraft
- **Egypt:** More presidential fleet
- **Iraq:** Government aircraft

---

## 🎯 Priority 6: European NATO (New Members) - ADD 20

- **Sweden:** Government aircraft (4A8000-4AFFFF) - NEW NATO
- **Finland:** Government aircraft (460000-467FFF) - NEW NATO
- **Norway:** Government aircraft
- **Denmark:** Government aircraft
- **Belgium:** Government aircraft
- **Portugal:** Government aircraft
- **Greece:** Government aircraft
- **Czech Republic:** Government aircraft
- **Romania:** Government aircraft

---

## 🎯 Priority 7: Russian Military (If Trackable) - ADD 10

- **Il-76 cargo:** More beyond current (critical for deployments)
- **Tu-95 Bear:** Strategic bombers
- **Tu-160 Blackjack:** Strategic bombers
- **An-124:** Super heavy cargo

**Note:** Russian aircraft may be harder to track due to:
- Less ADS-B coverage in Russia
- Military may disable transponders
- Limited OpenSky coverage

---

## Quick Add List (Copy-Paste Ready)

### Immediate Adds (Have ICAO Hex Codes)

```csv
icao_hex,registration,aircraft_type,owner_country,owner_org,is_military,is_government,is_vip,is_intel,vip_tier,home_base_airport,notes
00AEC9,ZS-RSA,Boeing 737-7ED,ZA,South African AF,1,1,1,0,1,FAWB,South African President - LMG1
4241AC,5N-FGA,Airbus A330-243,NG,Nigerian AF,1,1,1,0,1,DNAA,Nigerian President - Eagle One
04C030,KAF308,Fokker 70,KE,Kenya AF,1,1,1,0,1,HKJK,Kenyan President - Harambee One
E200DD,ARG-01,Boeing 757-256,AR,Argentine AF,1,1,1,0,1,SAEZ,Argentine President
AE0590,58-0066,Boeing KC-135R,US,USAF,1,0,0,0,4,KMCF,KC-135 Stratotanker
AE05B1,63-8878,Boeing KC-135R,US,USAF,1,0,0,0,4,KMCF,KC-135 Stratotanker
AE63BE,20-46082,Boeing KC-46A,US,USAF,1,0,0,0,4,KPAE,KC-46 Pegasus
AE222C,167951,Boeing P-8A,US,US Navy,1,0,0,1,4,KNTU,P-8 Poseidon
AE222D,167952,Boeing P-8A,US,US Navy,1,0,0,1,4,KNTU,P-8 Poseidon
AE01CE,64-14841,Boeing RC-135W,US,USAF,1,0,0,1,3,KOFF,RC-135 Rivet Joint
AE5582,60-0032,Boeing B-52H,US,USAF,1,0,0,0,3,KBAD,B-52 Stratofortress
AE540C,11-0060,Boeing CV-22B,US,USAF,1,0,0,1,3,KHRT,CV-22 Osprey
```

---

## Tools to Use

### 1. Run Expansion Script
```bash
cd ~/airplane-sleep-watch
python3 scripts/expand_aircraft_db.py
```

This will:
- Add manually curated high-value aircraft (12 ready)
- Optionally download ADS-B Exchange DB (9,000+ military aircraft)
- Filter for priority types (KC-135, P-8, C-17, etc.)
- Add up to 50 of each type

### 2. Manual Research Sites
- **ADS-B Exchange:** https://globe.adsbexchange.com (click aircraft for hex)
- **ADS-B.NL Military:** https://www.ads-b.nl/index.php?pageno=1504
- **FlightRadar24:** https://www.flightradar24.com (search tail numbers)
- **Planespotters:** https://www.planespotters.net (registration lookup)

### 3. Hex Code Ranges (Search by Country)
- **US Military:** A00000-AFFFFF (AE=military)
- **Saudi Arabia:** 601800-601BFF
- **Japan:** 780000-7BFFFF
- **South Korea:** 710000-717FFF
- **Singapore:** 718000-71FFFF
- **Sweden:** 4A8000-4AFFFF
- **Finland:** 460000-467FFF
- **Full list:** https://www.kloth.net/radio/icao-id.php

---

## Recommended Approach

### Week 1: Quick Wins (Get to 250+)
1. Run `expand_aircraft_db.py` (adds 12 immediately)
2. Download ADS-B Exchange DB
3. Filter for KC-135 (add 50)
4. Filter for P-8 (add 50)
5. **Total: ~298 aircraft** ✅

### Week 2: Reach 400+
1. Add more US tankers (KC-135, KC-46)
2. Add African presidential aircraft (10)
3. Add South American leaders (8)
4. Add more US ISR aircraft
5. **Total: ~400 aircraft** ✅

### Week 3: Reach 500+
1. Add Asian-Pacific government (20)
2. Add Middle East VIP (15)
3. Add European NATO new members (20)
4. Add US bombers (20)
5. Add special operations (25)
6. **Total: ~500+ aircraft** ✅

---

## Viral Impact of Additions

### African Leaders = HUGE
- Coups, summits, AU meetings
- Very trackable (fewer aircraft in African airspace)
- Instant news value

### US Tankers = Strategic Signal
- KC-135 deployment = something big
- Multiple tankers to region = military operation
- European/Middle East/Pacific deployments = escalation

### Bombers = Escalation Warning
- B-52 to Europe = deterrence/show of force
- B-1 deployment = strike readiness
- B-2 movement = nuclear posture

### More P-8 = Submarine Hunting
- P-8 surge to area = sub activity
- Multiple P-8s = major ASW operation
- Pacific P-8 = China-related

---

## Expected Results

### Current (186 aircraft)
- 10-50 aircraft visible at any time
- Some gaps in coverage
- Missing major deployments

### After Expansion (400+ aircraft)
- 50-150 aircraft visible at any time
- Much better coverage
- Catch more deployments/movements
- Higher panic scores during events
- More viral moments

### Full Scale (500+ aircraft)
- 100-200 aircraft visible at any time
- Near-complete coverage
- Industry-standard tool
- Journalists use daily
- Predict events reliably

---

## Next Steps

1. **Run expansion script NOW:**
   ```bash
   python3 scripts/expand_aircraft_db.py
   ```

2. **Re-seed database:**
   ```bash
   python3 scripts/seed_aircraft.py
   ```

3. **Restart ingestion:**
   ```bash
   python3 src/ingest_opensky.py
   ```

4. **Watch the magic happen** ✨

---

**With 400-500 aircraft, you'll have the most comprehensive open-source government aircraft tracker in the world.**
