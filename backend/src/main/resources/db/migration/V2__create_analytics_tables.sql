CREATE TABLE company_search_events (
    id BIGSERIAL PRIMARY KEY,
    query VARCHAR(512) NOT NULL,
    normalized_query VARCHAR(512) NOT NULL,
    result_count INTEGER NOT NULL,
    selected_company_number VARCHAR(16),
    selected_company_name VARCHAR(512),
    anonymous_session_id VARCHAR(64),
    ip_hash VARCHAR(128),
    user_agent_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_search_events_created ON company_search_events (created_at DESC);
CREATE INDEX idx_search_events_normalized ON company_search_events (normalized_query);

CREATE TABLE company_report_views (
    id BIGSERIAL PRIMARY KEY,
    company_number VARCHAR(16) NOT NULL,
    company_name VARCHAR(512),
    risk_score INTEGER,
    risk_level VARCHAR(16),
    anonymous_session_id VARCHAR(64),
    source VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_report_views_company ON company_report_views (company_number, created_at DESC);

CREATE TABLE feedback_events (
    id BIGSERIAL PRIMARY KEY,
    company_number VARCHAR(16) NOT NULL,
    rating SMALLINT NOT NULL,
    use_case VARCHAR(64) NOT NULL,
    comment TEXT,
    anonymous_session_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
