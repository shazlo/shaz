# ADR 0007: Two services: Core (Django) and Vendor-admin (FastAPI)

| | |
| --- | --- |
| Status | Accepted by the team (direction). **Amended by ADR 0008**, which moves commerce into Core |
| Date | 2026-10-19, amended 2026-10-20 |
| Related | `architecture.md`, `08-service-split.md`, ADR 0001, 0002, 0004, 0008 |

## Context

ADR 0001 chose one modular monolith. The team then agreed that the vendor and admin side should be its own service in FastAPI. Reasons given or implied: vendors and admins have higher privilege and a different audience from shoppers; the vendor and admin work can be built by one track in parallel; a clean new codebase avoids the bug debt of today's backend.

## Options

1. **One backend** (ADR 0001). Least operating work, strongest consistency, but the team did not want it.
2. **Two services:** the customer-facing Core and a vendor and admin service.
3. **Many small services** (vendors, catalog, orders, payments separately). Too much operating work for three engineers.

## Decision

Option 2.

- **Core** (Django): customer identity, swipes, taste, feed, closets, embeddings, and (ADR 0008) cart, checkout, orders, stock and payments.
- **Vendor-admin service** (FastAPI): vendors, vendor and admin accounts, product authoring and price master, fulfilment screens, order read copy, commission settings, statements, admin tools.
- Separate databases (`shazlo_core`, `shazlo_vendor`) on one Postgres server; no cross-database access.
- Commands go over a synchronous internal API (vendor-admin to Core); facts go out as events through a transactional outbox, in both directions.
- Separate identities and token issuers; no shared users.

## Consequences

- Vendor and admin can be deployed, secured and changed without touching Core; a customer token cannot reach vendor or admin data.
- Data is copied (the catalog copy in Core, the order copy in the vendor-admin database), so it is eventually consistent; reconciliation is required.
- More work before Oct 30: two services, a portal, contracts, two deploys. `architecture.md` section 14 gives the schedule and the cut order.
- ADR 0001's rules (layers, service and selector split, import-linter) apply **inside each service**. ADR 0004 changes: customers and vendors have separate token issuers; the portal uses vendor tokens from the start.
- ADR 0002 is narrowed: GraphQL (target) and REST (MVP) concern the **Core** app API only; the vendor-admin API is REST (FastAPI and OpenAPI).

## Revisit when

- The team is too small to run two services reliably (merge the vendor-admin code back as a module; the module boundaries make that possible).
- Event volume or ordering needs a real message broker.
