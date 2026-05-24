# CareerMoveChecker

Know who you're dealing with before you make your next move.

UK B2B SaaS that turns public UK company data (Companies House) into a plain-English trust report.

> Not a credit report. Not legal/financial/employment advice. Not AML/KYB verification. Decision-support based on visible public-data signals.

## Status

MVP build in progress. **Frontend-only first** — Spring Boot backend lands in a later pass. Frontend currently runs against an in-memory mock API that mirrors the planned `/api/**` contract.

## Repo layout

```
CareerMoveChecker/
  README.md
  .gitignore
  frontend/              # React + TS + Vite + Tailwind, custom components
  backend/               # Spring Boot 3 / Java 21 / Postgres / Flyway (TBD)
  Dockerfile             # single-container deploy (TBD)
  docker-compose.yml     # local Postgres (TBD)
  render.yaml            # Render.com deploy (TBD)
```

## Local dev (frontend)

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## Routes

```
/                    landing
/pricing             pricing
/app/search          search
/app/company/:id     company report
/app/company/:id/print  print-friendly report
/app/compare         compare up to 3
/app/dashboard       saved companies
/admin               admin dashboard
/admin/alerts        downstream data-quality alerts
```

Admin pages are mock-gated by an `ADMIN_PASSWORD` prompt in v1.

## Disclaimer

CareerMoveChecker uses public data sources, primarily Companies House, to support general business and career due diligence. It is not a credit report, legal advice, financial advice, AML/KYB verification, employment advice, or a guarantee of solvency, safety, or trustworthiness. Always verify important decisions with appropriate professional checks.
