-- =====================================================================
-- SentinelForge: TimescaleDB Telemetry Schema (Hypertable Engine)
-- Per Section 5.2 of SentinelForge Product Requirements Document (PRD)
-- =====================================================================

-- Ensure TimescaleDB extension is active
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Fuzz Execution Telemetry Engine (Hypertable)
-- Captures high-frequency execution rate, path discoveries, bitmap density, and memory
CREATE TABLE IF NOT EXISTS fuzz_execution_telemetry (
    time TIMESTAMPTZ NOT NULL,
    firmware_id UUID NOT NULL,
    worker_id VARCHAR(64) NOT NULL,
    execs_per_sec DOUBLE PRECISION NOT NULL,
    total_execs BIGINT NOT NULL,
    paths_found INT NOT NULL,
    crashes_discovered INT NOT NULL,
    current_hangs INT NOT NULL,
    memory_usage_mb INT NOT NULL,
    bitmap_density REAL NOT NULL
);

-- Convert to TimescaleDB Hypertable partitioned on time (default 7-day chunks)
SELECT create_hypertable('fuzz_execution_telemetry', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_fuzz_telemetry_firmware_time ON fuzz_execution_telemetry (firmware_id, time DESC);

-- Chunk Compression Policy (Trigger after 48 hours per PRD Section 8.1)
ALTER TABLE fuzz_execution_telemetry SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'firmware_id, worker_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('fuzz_execution_telemetry', INTERVAL '48 hours', if_not_exists => TRUE);

-- 2. Execution Crashes Engine (Hypertable)
-- Captures deterministic crash hashes, CPU fault registers, canary status, and payloads
CREATE TABLE IF NOT EXISTS execution_crashes (
    time TIMESTAMPTZ NOT NULL,
    firmware_id UUID NOT NULL,
    crash_hash VARCHAR(64) NOT NULL,
    signal_type VARCHAR(16) NOT NULL,
    faulting_address VARCHAR(32) NOT NULL,
    pc_register VARCHAR(32) NOT NULL,
    stack_canary_intact BOOLEAN NOT NULL,
    registers_state JSONB NOT NULL,
    payload_size_bytes INT NOT NULL
);

-- Convert to TimescaleDB Hypertable partitioned on time
SELECT create_hypertable('execution_crashes', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_crashes_firmware ON execution_crashes (firmware_id, crash_hash, time DESC);

-- 3. Telemetry Continuous Aggregate (1-minute Rollup for Long-Term Fleet Analytics)
-- Downsamples telemetry older than 30 days per PRD Section 8.1
CREATE MATERIALIZED VIEW IF NOT EXISTS fuzz_telemetry_1m_rollup
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    firmware_id,
    AVG(execs_per_sec) AS avg_execs_per_sec,
    MAX(execs_per_sec) AS max_execs_per_sec,
    MAX(total_execs) AS total_execs,
    MAX(paths_found) AS total_paths_found,
    MAX(crashes_discovered) AS total_crashes,
    AVG(bitmap_density) AS avg_bitmap_density,
    MAX(memory_usage_mb) AS peak_memory_mb
FROM fuzz_execution_telemetry
GROUP BY bucket, firmware_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('fuzz_telemetry_1m_rollup',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute',
    if_not_exists => TRUE);
