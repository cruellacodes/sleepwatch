# Airplane Sleep Watch - Frontend

Next.js frontend for real-time government/military aircraft tracking and panic score visualization.

## Features

- 🗺️ **Live Aircraft Map** - Real-time tracking of gov/mil/VIP aircraft
- 📊 **Panic Score Dashboard** - Visual panic scores (0-100) per region
- 📈 **Historical Charts** - Track score trends over time
- ✈️ **Active Aircraft List** - Detailed list of currently tracked aircraft
- 🎨 **Dark Theme** - Optimized for OSINT/tracking work
- 📱 **Responsive Design** - Works on mobile and desktop

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Maps:** React Leaflet
- **Charts:** Recharts
- **Database:** ClickHouse (via HTTP API)

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Running ClickHouse instance (see parent README)
- Data ingestion pipeline running

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment config
cp .env.local.example .env.local

# Edit .env.local with your ClickHouse connection
# nano .env.local

# Start development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── api/                # API routes (ClickHouse queries)
│       ├── scores/
│       ├── aircraft/
│       └── history/
├── components/
│   ├── PanicScoreCard.tsx  # Panic score display
│   ├── AircraftMap.tsx     # Live map with aircraft markers
│   ├── HistoricalChart.tsx # Time-series chart
│   └── ActiveAircraftList.tsx # Aircraft table
└── lib/
    └── clickhouse.ts       # ClickHouse client
```

## API Routes

### GET /api/scores
Returns latest panic scores for all regions

**Response:**
```json
{
  "scores": [
    {
      "region": "Global",
      "overall_panic_score": 28,
      "night_flight_score": 12.3,
      "convergence_score": 45.6,
      "airlift_score": 8.2,
      "vip_movement_score": 23.1,
      "narrative": "⚠️ 🇺🇸 🇬🇧 🇫🇷 jets converging",
      "flight_count": 45,
      "countries_involved": 8,
      "timestamp": "2026-01-17T12:00:00Z"
    }
  ]
}
```

### GET /api/aircraft
Returns currently visible aircraft positions

### GET /api/aircraft/active
Returns aircraft active in last hour

### GET /api/history?region=Global&days=7
Returns historical panic scores

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Make sure ClickHouse is accessible from Vercel
```

### Docker

```bash
# Build
docker build -t airplane-sleep-watch-frontend .

# Run
docker run -p 3000:3000 \
  -e CLICKHOUSE_URL=http://your-clickhouse:8123 \
  -e CLICKHOUSE_DB=airplane_watch \
  airplane-sleep-watch-frontend
```

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development Notes

### Mock Data

API routes return mock data when ClickHouse connection fails, allowing frontend development without backend.

### Auto-Refresh

- Panic scores: Every 30 seconds
- Aircraft positions: Every 30 seconds
- Historical data: On initial load only

### Performance

- Aircraft map limited to 100 most recent aircraft
- Active list limited to 50 aircraft
- Historical chart queries last 7 days by default

## Customization

### Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  'panic-low': '#22c55e',     // Green (0-25)
  'panic-medium': '#eab308',  // Yellow (25-50)
  'panic-high': '#ef4444',    // Orange (50-75)
  'panic-extreme': '#dc2626', // Red (75-100)
}
```

### Map Style

Change tile layer in `components/AircraftMap.tsx`:
```typescript
// Dark theme (current)
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

// Light theme
url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

// Satellite
url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
```

## Troubleshooting

### Map not loading
- Leaflet requires client-side rendering
- Already handled with `dynamic(() => import(...), { ssr: false })`

### No data showing
1. Check ClickHouse is running: `docker ps | grep clickhouse`
2. Check ingestion pipeline is running
3. Check data exists: `SELECT count() FROM flight_positions`
4. Check API routes: `curl http://localhost:3000/api/scores`

### ClickHouse connection errors
- Make sure ClickHouse HTTP interface (port 8123) is accessible
- Check `.env.local` settings
- Try: `curl http://localhost:8123/ping`

## Next Steps

1. **Add regions** - Implement regional scoring (Brussels, DC, etc.)
2. **Add filters** - Filter by country, aircraft type, VIP status
3. **Add alerts** - Real-time notifications for high panic scores
4. **Add OG images** - Dynamic social share images
5. **Add auth** - Pro tier with API keys
6. **Add webhooks** - Push notifications for high scores

## License

MIT
