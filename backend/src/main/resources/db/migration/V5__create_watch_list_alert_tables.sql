CREATE TABLE watch_list_alerts (
    id BIGSERIAL PRIMARY KEY,
    company_number VARCHAR(16) NOT NULL,
    company_name VARCHAR(512) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    alert_type VARCHAR(40) NOT NULL,
    title VARCHAR(256) NOT NULL,
    description TEXT,
    means_candidate TEXT,
    means_freelancer TEXT,
    means_agency TEXT,
    evidence_json JSONB,
    unread BOOLEAN NOT NULL DEFAULT TRUE,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_watch_alerts_occurred ON watch_list_alerts (occurred_at DESC);
CREATE INDEX idx_watch_alerts_company ON watch_list_alerts (company_number, occurred_at DESC);
CREATE INDEX idx_watch_alerts_unread ON watch_list_alerts (unread) WHERE unread = TRUE;

-- track per-company last seen filing transaction id and last known status, so the poller can diff
CREATE TABLE watch_list_state (
    company_number VARCHAR(16) PRIMARY KEY,
    last_filing_txn_id VARCHAR(128),
    last_filing_date DATE,
    last_status VARCHAR(64),
    last_polled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
