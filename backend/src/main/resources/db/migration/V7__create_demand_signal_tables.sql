CREATE TABLE waitlist_signups (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    persona VARCHAR(16),
    tier VARCHAR(16),
    role VARCHAR(128),
    referrer VARCHAR(512),
    landing_path VARCHAR(256),
    anonymous_session_id VARCHAR(64),
    user_agent_hash VARCHAR(128),
    ip_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_waitlist_email UNIQUE (email)
);
CREATE INDEX idx_waitlist_created ON waitlist_signups (created_at DESC);
CREATE INDEX idx_waitlist_persona ON waitlist_signups (persona);
CREATE INDEX idx_waitlist_tier ON waitlist_signups (tier);

CREATE TABLE page_view_events (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(256) NOT NULL,
    referrer VARCHAR(512),
    persona VARCHAR(16),
    anonymous_session_id VARCHAR(64),
    user_agent_hash VARCHAR(128),
    is_first_visit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pageviews_created ON page_view_events (created_at DESC);
CREATE INDEX idx_pageviews_path ON page_view_events (path, created_at DESC);
CREATE INDEX idx_pageviews_session ON page_view_events (anonymous_session_id, created_at);

CREATE TABLE cta_click_events (
    id BIGSERIAL PRIMARY KEY,
    cta_id VARCHAR(64) NOT NULL,
    path VARCHAR(256),
    persona VARCHAR(16),
    anonymous_session_id VARCHAR(64),
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cta_created ON cta_click_events (created_at DESC);
CREATE INDEX idx_cta_id ON cta_click_events (cta_id, created_at DESC);
