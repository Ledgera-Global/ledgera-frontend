# Ledgera Architecture Upgrade Plan

## Goal

- Multi-location support (one account, many branches)
- Institutional onboarding (Contract → pay → access)
- Everything rolled up by default, drill-down by location

## 1. Data Model (Prisma)

### New: Location

```text
Location
  id          String @id
  companyId   String (FK → Company)
  name        String       // "Atlanta Branch"
  address     String?
  phone       String?
  active      Boolean @default(true)
  createdAt   DateTime
```

### Updated Tables

- **Job** → `locationId` (nullable, backward compat)
- **Technician** → `locationId` (nullable)
- **ServiceType** → `locationId` (nullable)
- **Contract** → `locationId(s)` or keep at company level

## 2. APIs

- `GET /companies/:id/locations` — list locations
- `POST /companies/:id/locations` — create location
- `GET /companies/:id/locations/:locationId/stats` — per-location rollup
- All existing `/jobs`, `/technicians`, etc. gain `?locationId=` filter
- No `locationId` → company-wide rollup (default)

## 3. Engines (backend services)

All engines (profitAlertEngine, dashboardMetricsEngine, leakageScoreEngine, etc.) already take `companyId`. They gain an optional `locationId` parameter. When provided, Prisma queries filter by both `companyId` AND `locationId`. When omitted, company-wide rollup.

## 4. Onboarding Flow

Current: signup → dashboard

New flow:

```text
signup → EULA → DocuSign envelope (contract) →
DocuSign callback (webhook: envelope.completed) →
Stripe Checkout Session →
Stripe webhook (checkout.session.completed) →
activate company → dashboard
```

The Contract model already has DocuSign fields ready: `envelopeId`, `envelopeStatus`, `signedAt`, `signedPdfPath`, `clientName`, `clientEmail`.

## 5. Frontend

- Location switcher in dashboard header (dropdown)
- Dashboard KPI cards + all components accept `locationId` prop
- URL param: `/dashboard?locationId=xxx`

## Implementation Order

1. Prisma schema (Location model + FK migrations)
2. Location CRUD routes
3. Update backend engines with optional locationId
4. DocuSign + Stripe onboarding sequence
5. Frontend location selector + prop drill
