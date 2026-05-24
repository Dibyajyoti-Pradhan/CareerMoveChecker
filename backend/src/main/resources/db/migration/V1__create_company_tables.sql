CREATE TABLE company_raw_snapshots (
    id BIGSERIAL PRIMARY KEY,
    company_number VARCHAR(16) NOT NULL,
    source_type VARCHAR(40) NOT NULL,
    raw_json JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_raw_snapshots_company_source ON company_raw_snapshots (company_number, source_type, fetched_at DESC);

CREATE TABLE company_risk_reports (
    id BIGSERIAL PRIMARY KEY,
    company_number VARCHAR(16) NOT NULL UNIQUE,
    company_name VARCHAR(512) NOT NULL,
    company_status VARCHAR(64),
    company_type VARCHAR(128),
    incorporated_on DATE,
    score INTEGER NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    verdict TEXT NOT NULL,
    top_reasons_json JSONB NOT NULL,
    flags_json JSONB NOT NULL,
    recommended_actions_json JSONB NOT NULL,
    scoring_engine VARCHAR(40) NOT NULL,
    scoring_model_version VARCHAR(40) NOT NULL,
    input_fingerprint VARCHAR(64) NOT NULL,
    explanation_summary TEXT,
    confidence DOUBLE PRECISION,
    data_fetched_at TIMESTAMPTZ NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE saved_companies (
    id BIGSERIAL PRIMARY KEY,
    company_number VARCHAR(16) NOT NULL UNIQUE,
    company_name VARCHAR(512) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
