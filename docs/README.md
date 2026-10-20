# Shazlo design and planning docs

| | |
| --- | --- |
| Status | Draft v1.0 for team review |
| Date | 2026-10-19 |
| Audience | The three engineers, the founders and ops, anyone joining the team |

These documents describe who Shazlo is for, how users move through it, how the system fits together (customer app, vendor portal, admin, website, and the two backend services), the database, and the API. They separate what ships by **Oct 30** (the MVP) from the **target** architecture, and they say what is still undecided.

## Start here

**[architecture.md](architecture.md)** is the authoritative, production-grade architecture document (system design picture, technology map, service boundary, data, integration, flows, consistency, security, operations, deployment, scale, cost, testing, roadmap). The numbered documents below go deeper on one topic each and are aligned to it.

## Read in this order

| # | Document | What it answers |
| --- | --- | --- |
| - | [Architecture](architecture.md) | The whole system in one document, with the technology map and the production concerns |
| 01 | [Personas](01-personas.md) | Who are the customers, vendors and internal users, and what do they need? |
| 02 | [User flows](02-user-flows.md) | How does each persona move through the product? What are the states of vendors, products, orders and payments? |
| 03 | [System architecture](03-system-architecture.md) | What runs where, how modules relate, security, deployment, scale |
| 04 | [Database design](04-database-design.md) | The list of all 58 tables and their indexes, in two databases |
| 04b | [Database notes](04b-database-notes.md) | Design rules, cross-database references, vectors, migration from today's tables, Redis keys, personal data, MVP delta |
| 05 | [API design](05-api-design.md) | GraphQL schema for the app, REST for vendor, public, admin and webhooks, errors, limits |
| 06 | [MVP slice and migration](06-mvp-slice-and-migration.md) | Exactly what is built by Oct 30 on today's backend, and how it migrates to the new server |
| 07 | [Website audit and plan](07-website-audit-and-plan.md) | What is wrong with the marketing site, and what to fix |
| 08 | [Service split](08-service-split.md) | Core and Vendor-admin: the boundary rule, what changed in the redraw, builder checklist |
| - | [Core build and migration plan](core-build-plan.md) | The month-long plan to build Core in `shazlo-server`, migrate the old data, then migrate the app |
| - | [Open questions](open-questions.md) | Decisions the team still has to make, each with a default |
| - | [Decision records](adr/) | Why the big choices were made |

## Decision records

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](adr/0001-modular-monolith.md) | Modular monolith with service and selector layers (now inside each service) | Accepted, amended by 0007 |
| [0002](adr/0002-api-style.md) | GraphQL for the app, REST for the rest; MVP on REST | Proposed |
| [0003](adr/0003-pgvector-over-pinecone.md) | pgvector in Postgres instead of Pinecone | Accepted |
| [0004](adr/0004-authentication.md) | Own JWT with guest accounts | Accepted (target) |
| [0005](adr/0005-images-and-cdn.md) | Cloudinary now, object storage and CDN later | Accepted (MVP) |
| [0006](adr/0006-manual-order-flow-before-online-payments.md) | Order requests and manual settlement at launch; online payments built behind a switch | Accepted (MVP), amended |
| [0007](adr/0007-core-and-vendor-admin-services.md) | Two services: Core (Django) and Vendor-admin (FastAPI) | Accepted (direction), amended by 0008 |
| [0008](adr/0008-commerce-in-core.md) | Commerce (cart, checkout, orders, stock, payments) lives in Core; vendor-admin is the seller back-office | Accepted |

## Legend

| Tag | Meaning |
| --- | --- |
| `[As-is]` | True today, verified in the code or the website source |
| `[MVP]` | Built by the Oct 30 freeze on today's Django backend |
| `[Target]` | The design for the new server (`shazlo-server`) |
| `[Assumption]` | A proposal or guess that needs a team decision (see `open-questions.md`) |

## Shared vocabulary

| Term | Meaning |
| --- | --- |
| Guest | A user created automatically on first launch, with no sign-up; becomes a customer by upgrading the same account |
| Core service, vendor-admin service | The two backends: Core is the Django service for customers **and commerce** (cart, checkout, orders, stock, payments); the vendor-admin service is the FastAPI seller back-office (vendors, catalog authoring, fulfilment screens, statements, admin) |
| Customer, vendor owner, vendor staff, admin | The roles in `03` section 6 |
| Vendor | A brand or boutique that lists and fulfils products (the `Brand` model today) |
| Embedding | 512 numbers describing how a product looks, made by the image model |
| Taste vector | 512 numbers describing what a user likes, updated by each swipe |
| Slate | One batch of 10 products: 7 from the user's strongest category and 3 from others |
| Order request | The MVP order: placed by the customer, confirmed by the vendor, paid in cash or UPI on delivery |
| MVP slice | The part of the target built on today's backend by Oct 30 |
| Target | The new server's architecture, built after launch |

## Conventions used across the documents

- Roles: `guest`, `customer`, `vendor_owner`, `vendor_staff`, `admin`.
- Enumerations (vendor, product, order, payment, swipe action) are listed once in `04` section 4 and reused everywhere.
- Money is an integer number of paise; time is UTC; ids are UUIDs.
- Code lives in two repositories (`shaz` for the app and core backend; the portal repo for the vendor frontend, the vendor-admin backend and the contracts), see `architecture.md` section 10.2.
- Diagrams are Mermaid text, so they render in most repository viewers and are reviewed in pull requests.

## External references

These documents grew out of earlier working documents, which live outside this repository:
- **Shazlo Production Architecture Plan** (a longer plan, with the full target architecture).
- **Shazlo Production Readiness Plan** with a **Bug register** tab. Register ids such as `SEC-01` or `AI-08` quoted in `06` refer to that tab.

## Maintaining these docs

- Change a document in a pull request, with a one-line note at the top of the document's table when a decision changes.
- When a question in `open-questions.md` is decided, write the answer there, update the affected document and, for a bigger choice, add an ADR.
- Keep names (roles, enums, paths, tables) identical across documents; a mismatch is a bug.
- Owners for each document are to be assigned; until then the engineer who changes the area updates the document.

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-19 | First draft of all documents |
| 2026-10-19 | v0.2: vendor and admin split into a FastAPI marketplace service (new `08`, ADR 0007; `03` to `06` carry pointers and corrections) |
| 2026-10-19 | v0.3: team answers recorded (`open-questions.md`): two databases, outbox events, React portal, SQLAdmin, 15% commission, one-VM hosting, two repositories, online payments behind a switch |
| 2026-10-20 | v1.0: **new master `architecture.md`**; the service boundary is corrected (commerce, stock and Razorpay in Core; the FastAPI service renamed vendor-admin and limited to the seller back-office; ADR 0008); docs 01 to 08 rewritten to match |
