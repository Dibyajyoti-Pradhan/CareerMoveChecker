CREATE TABLE admin_audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64),
    target_id VARCHAR(128),
    summary TEXT,
    detail_json JSONB,
    ip_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_audit_created ON admin_audit_log (created_at DESC);
CREATE INDEX idx_admin_audit_actor ON admin_audit_log (actor, created_at DESC);
CREATE INDEX idx_admin_audit_action ON admin_audit_log (action, created_at DESC);

CREATE TABLE app_settings (
    key VARCHAR(128) PRIMARY KEY,
    value TEXT NOT NULL,
    value_type VARCHAR(16) NOT NULL,
    description TEXT,
    updated_by VARCHAR(64),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE kill_switches (
    key VARCHAR(64) PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    reason TEXT,
    updated_by VARCHAR(64),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (key, value, value_type, description) VALUES
    ('cmc.alerts.poll-interval-ms', '600000', 'LONG', 'Watch-list alert poll cadence in ms'),
    ('cmc.cache.profile-ttl-hours', '24', 'LONG', 'Profile cache TTL in hours'),
    ('cmc.cache.officers-ttl-hours', '24', 'LONG', 'Officers cache TTL in hours'),
    ('cmc.cache.filing-history-ttl-hours', '12', 'LONG', 'Filing history cache TTL in hours'),
    ('cmc.risk.engine', 'RULE_BASED', 'STRING', 'Active risk scoring engine'),
    ('cmc.risk.model-version', 'rules-v1', 'STRING', 'Active scoring model version'),
    ('cmc.ch.rate-limit-per-5min', '600', 'LONG', 'Self-imposed rate limit per 5 minute window');

INSERT INTO kill_switches (key, enabled, reason) VALUES
    ('disable_ch_writes', FALSE, 'Block any state-changing operations'),
    ('disable_bulk_endpoint', FALSE, 'Block /api/companies/bulk endpoint'),
    ('disable_alerts_polling', FALSE, 'Pause watch-list polling job'),
    ('disable_signups', FALSE, 'Block new sign-ups'),
    ('disable_new_searches', FALSE, 'Block /api/companies/search');
