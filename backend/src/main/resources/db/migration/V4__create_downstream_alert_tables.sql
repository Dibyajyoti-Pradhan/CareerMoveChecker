CREATE TABLE downstream_alerts (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    endpoint VARCHAR(256) NOT NULL,
    company_number VARCHAR(16),
    company_name VARCHAR(512),
    alert_type VARCHAR(40) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'OPEN',
    title VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    evidence_json JSONB NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    suppressed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_downstream_alerts_status ON downstream_alerts (status, severity, last_seen_at DESC);
CREATE INDEX idx_downstream_alerts_open ON downstream_alerts (status) WHERE status = 'OPEN';
