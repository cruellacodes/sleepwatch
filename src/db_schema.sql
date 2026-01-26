-- ClickHouse schema for Airplane Sleep Watch
-- Run this to set up your database

CREATE DATABASE IF NOT EXISTS airplane_watch;

USE airplane_watch;

-- Core aircraft registry (curated list of gov/mil/VIP aircraft)
CREATE TABLE IF NOT EXISTS aircraft_profiles (
    icao_hex String,
    registration String,
    aircraft_type String,
    owner_country String,
    owner_org String,

    -- Classification flags
    is_military UInt8,
    is_government UInt8,
    is_vip UInt8,
    is_intel UInt8,

    -- Weight for panic scoring (1=president, 2=minister, 3=senior, 4=regular gov)
    vip_tier UInt8,

    home_base_airport String,
    notes String,
    last_updated DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY icao_hex;

-- Live position stream (high-volume, time-series optimized)
CREATE TABLE IF NOT EXISTS flight_positions (
    timestamp DateTime,
    icao_hex String,
    callsign String,
    lat Float64,
    lon Float64,
    altitude Int32,
    ground_speed Int32,
    heading Int32,
    vertical_rate Int32,
    on_ground UInt8,
    source String
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (icao_hex, timestamp);

-- Parsed flight events (takeoffs/landings)
CREATE TABLE IF NOT EXISTS flight_events (
    event_id String,
    icao_hex String,
    callsign String,

    -- Flight details
    departure_airport String,
    arrival_airport String,
    departure_time DateTime,
    arrival_time DateTime,
    flight_duration_minutes Int32,

    -- Geo-context
    departure_country String,
    arrival_country String,
    departure_region String,
    arrival_region String,

    -- Time-context (key for anomaly detection)
    is_night_departure UInt8,
    is_night_arrival UInt8,
    is_weekend_departure UInt8,
    is_weekend_arrival UInt8,
    is_holiday_departure UInt8,
    is_holiday_arrival UInt8,

    -- Aircraft context (denormalized for speed)
    owner_country String,
    owner_org String,
    vip_tier UInt8,
    is_military UInt8,

    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (arrival_time, event_id);

-- Airport metadata
CREATE TABLE IF NOT EXISTS airports (
    icao_code String,
    iata_code String,
    name String,
    lat Float64,
    lon Float64,
    country String,
    timezone String,

    -- Custom tags
    is_diplomatic_hub UInt8,
    is_conflict_zone UInt8,
    is_logistics_hub UInt8,
    risk_level UInt8,
    tags Array(String)
) ENGINE = MergeTree()
ORDER BY icao_code;

-- Activity baselines (for anomaly detection)
CREATE TABLE IF NOT EXISTS activity_baselines (
    route_key String,
    time_window String,

    -- Rolling statistics (last 90 days)
    avg_flights_per_day Float64,
    stddev Float64,
    max_flights_observed Int32,

    last_updated DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(last_updated)
ORDER BY (route_key, time_window);

-- Panic scores (computed every 15min)
CREATE TABLE IF NOT EXISTS panic_scores (
    timestamp DateTime,
    region String,

    -- Component scores
    night_flight_score Float32,
    convergence_score Float32,
    airlift_score Float32,
    vip_movement_score Float32,

    -- Composite
    overall_panic_score Int32,

    -- Context
    flight_count Int32,
    countries_involved Int32,
    top_3_airports Array(String),
    narrative String
) ENGINE = MergeTree()
ORDER BY (timestamp, region);

-- Historical events (hand-labeled for training)
CREATE TABLE IF NOT EXISTS known_events (
    event_date Date,
    event_name String,
    event_type String,
    related_airports Array(String),
    panic_score_before Int32,
    panic_score_during Int32,
    notes String
) ENGINE = MergeTree()
ORDER BY event_date;
