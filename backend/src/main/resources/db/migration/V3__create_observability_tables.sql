CREATE TABLE external_api_call_logs (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    endpoint VARCHAR(256) NOT NULL,
    company_number VARCHAR(16),
    status_code INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    duration_ms INTEGER NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_call_logs_created ON external_api_call_logs (created_at DESC);
CREATE INDEX idx_api_call_logs_endpoint ON external_api_call_logs (endpoint, created_at DESC);
