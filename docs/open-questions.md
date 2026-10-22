# Open questions

| | |
| --- | --- |
| Status | Draft v0.3: answers from 2026-10-19 recorded as **Decided** |
| Date | 2026-10-19 |
| Purpose | Decisions only the team can make. Each has a **proposed default** so work can continue; change the default here when decided |

Owners are roles, to be assigned in the next meeting. "Needed by" is relative to the Oct 30 freeze.

## Product and business

| ID | Question | Proposed default | Needed by | Affects |
| --- | --- | --- | --- | --- |
| Q1 | Commission rate: the meeting said 10 to 20% (also 15 to 20%). One flat rate, or per vendor? | **Decided: 15% flat** for pilot vendors, stored per vendor (`commission_bps`); not published on the website until final | Oct 22 | `04`, `06`, `07`, vendor agreement |
| Q2 | Do we offer cash on delivery and UPI on delivery at launch? | **Decided, with a gate:** cash and UPI on delivery are the launch path; online payments (Razorpay) are built behind a switch and turned on when the business account is approved (it is not approved yet, see Q32) | Oct 22 | `02` C6, ADR 0006 |
| Q3 | Return window and who pays return shipping? | **Decided: 7 days**; vendor policy can shorten; Shazlo arranges the pickup | Oct 24 | `02` C7, `04` `vendor_policies`, website legal pages |
| Q4 | How long does a vendor have to confirm an order? | **Decided: 4 business hours**, then reminder, then auto-cancel | Oct 24 | `02` V3, `06` section 7 |
| Q5 | Which pincodes can order at launch? | Ahmedabad pincodes only (list to be supplied) | Oct 24 | `05` serviceability |
| Q6 | Which delivery partner, with what rates and pickup times? | **Decided: ops coordinate delivery by WhatsApp** for the first 3 to 4 months; admin marks delivered; the courier partner is still to be named | Oct 24 | `02` C6 and A3, `04` `deliveries` |
| Q7 | Who are the pilot vendors, and what does the vendor agreement say? (The signing was delayed because the bank account was not ready.) | At least three pilot vendors; agreement template covers commission, returns, delivery, payout timing | Oct 24 | `02` V1, `07` W3 and W4 |
| Q8 | GST and tax: who issues invoices and handles collection at source for a marketplace? Is a vendor GSTIN required? | Ask the accountant; `gstin` stays optional until answered | Oct 27 | `04` `vendors`, legal pages |
| Q9 | What are Shazlo Coins worth, and what can they be redeemed for? The website promises redemption after launch | Keep earning only, no redemption in the MVP | After launch | `04` `reward_events` |
| Q10 | Product categories, fabric values and filter lists | A small managed list agreed with vendors | Oct 22 | `04` `categories`, `02` C3 |
| Q11 | When a vendor edits an approved product, which edits require a new review? | **Decided: title, description and photos** go back to review; price and stock apply at once | Oct 24 | `02` V2, `05` section 5.3 |
| Q12 | Languages at launch; age limit and consent for minors | English first; 18 and over | Oct 27 | personas, legal pages |

## Technical

| ID | Question | Proposed default | Needed by | Affects |
| --- | --- | --- | --- | --- |
| Q13 | Final choice for the app API: REST or GraphQL (the meeting deferred it) | REST for the MVP; GraphQL as the target for the new server (ADR 0002) | Next technical meeting | `05`, `06` |
| Q14 | How is the vendor portal built? | **Decided by the service split:** React portal on the FastAPI vendor-admin API (Q31 keeps the server-rendered fallback) | Oct 19 | `architecture.md` section 2.2, `06` section 5 |
| Q15 | Hosting: a paid always-on Render plan now, or the Azure virtual machine? Which Postgres host, and does it support pgvector? | **Decided (cheapest and leanest): one small always-on VM** running both services, Postgres with pgvector and Caddy in Docker Compose behind Cloudflare, nightly backups to object storage; the Azure VM from the meeting if it exists, otherwise the cheapest suitable VPS; portal and website on Vercel; managed Postgres and a second VM only when needed (`architecture.md` section 10) | Oct 20 | `03` section 10, `06` section 8 |
| Q16 | Who sends WhatsApp messages: manual click-to-chat by ops, or an approved provider? | **Decided: manual click-to-chat** by ops; provider approval started in parallel | Oct 21 | `06` section 7 |
| Q17 | Share links: closet id (today) or revocable invite token? | Closet id in the MVP so old links work; token in the target | Oct 22 | `05` section 4, `07` |
| Q18 | Embedding model version and what happens when the embedding service is down | Single model version; approved products stay hidden until embedded, with retries | Oct 22 | `03` section 5.3, `04` |
| Q19 | Is the Expo migration attempted? | **Decided: a two-day gated experiment** (Oct 19 to 20) with a go or no-go; never a dependency | Oct 20 | Earlier plan documents |
| Q20 | Data retention periods and the grievance officer for the Digital Personal Data Protection Act | Ask counsel; draft wording in the legal pages | Oct 27 | `04b` section 6, `07` W4 |

## Service split (v0.2, see `architecture.md` section 15)

| ID | Question | Proposed default | Needed by | Affects |
| --- | --- | --- | --- | --- |
| Q26 | Where do cart, checkout, orders and payments live? | **Decided 2026-10-20: Core** (the earlier answer "marketplace" is withdrawn: payments and checkout belong to the customer buying path; ADR 0008) | Done | `architecture.md` section 2, `08` |
| Q27 | One database with two schemas, or two databases? | **Decided: two databases on one Postgres server** (`shazlo_core`, `shazlo_vendor`) | Oct 20 | `04` section 1 |
| Q28 | Vendor-admin stack details: async SQLAlchemy and psycopg 3, SQLAdmin for data screens, ARQ later | **Decided:** async SQLAlchemy and psycopg 3, SQLAdmin for admin, ARQ later | Oct 20 | `architecture.md` section 3 |
| Q29 | Event transport between services | **Decided:** database outbox plus signed HTTP delivery; a broker after launch if needed | Oct 20 | `architecture.md` section 5 |
| Q30 | Vendor and admin identity | **Decided: separate** vendor and admin accounts and tokens in the vendor-admin service | Oct 20 | `architecture.md` section 8 |
| Q31 | Portal build if the schedule slips | **Decided: React SPA**; server-rendered fallback only if the portal is behind by Oct 24 | Oct 24 | `08` section 9 |

## Repositories and access

| ID | Question | Proposed default | Needed by |
| --- | --- | --- | --- |
| Q21 | Which repository is canonical, and when do the repos move into a new GitHub Organisation? | **Decided:** `MauryaSamanta/shaz` is the mobile app repo and also holds the core backend (`backend/`); the vendor portal frontend, the FastAPI vendor-admin backend and the service contracts live in a second repo (name in Q33); the website stays in `naby001/Shazlo`; the GitHub Organisation comes later | Oct 20 |
| Q22 | Who gets write access (the person pushing the scaffold has none on `MauryaSamanta/shaz` yet)? | Send Git ids to the owner as agreed in the meeting | Oct 19 |
| Q23 | Who holds the Android upload key, and is Play App Signing on? | Hand the keystore to the team's password manager; confirm in Play Console | Oct 21 |
| Q24 | What are the Apple team id and the iOS bundle id (needed for universal links)? | Owner of the Apple developer account supplies them | Oct 23 |
| Q25 | Website blog approach | Markdown with pre-rendering (`07` section 6) | After launch |

## New questions from the answers (v0.3)

| ID | Question | Proposed default | Needed by | Affects |
| --- | --- | --- | --- | --- |
| Q32 | When is the Razorpay business account expected to be approved (the bank account delay)? Who submits the documents? | Keep the online-payment switch off until the approval and live keys exist; test mode on staging meanwhile | Oct 22 | `08` section 7.5, `06` |
| Q33 | What is the name of the second (portal) repository, who has write access, and is the vendor-admin backend allowed in it as `backend/`? | Confirmed placement (`frontend/`, `backend/`, `contracts/`); name and access to be supplied | Oct 20 | `08` section 10 |
| Q34 | Names of the three engineers and which track each owns (Track 1 core hardening and commerce, Track 2 vendor-admin service and portal, Track 3 app and feed)? | Tracks stay as roles until names are given | Oct 20 | `architecture.md` section 14.1 |
| Q35 | Is there an existing Azure VM with credits, and what size? If not, which VPS provider is acceptable? | Use the Azure VM if it exists; otherwise the cheapest provider with a nearby region and daily snapshots | Oct 21 | `08` section 11 |
| Q36 | Which object storage holds the nightly database backups (Cloudflare R2, Azure Blob, other)? | Cloudflare R2 (the Cloudflare account already exists) `[Assumption]` | Oct 24 | `08` section 11 |

## Still waiting for information only the team has

Q5 (launch pincodes), Q7 (pilot vendors and the agreement), Q8 (GST and invoices), Q9 (Coins), Q10 (categories and fabrics), Q12 (languages and age limit), Q17 (share links), Q18 (embedding service fallback), Q20 (retention and grievance officer), Q22 (write access), Q23 (Android upload key), Q24 (Apple ids), Q25 (blog). Their proposed defaults above stay in force until answered.

## Commerce and money (v1.0, from the 2026-10-20 review)

| ID | Question | Proposed default | Needed by | Affects |
| --- | --- | --- | --- | --- |
| Q37 | How does online money reach vendors once Razorpay is approved: Shazlo collects and pays vendors monthly, or Razorpay Route splits each payment to vendor linked accounts? | Collect and pay out monthly from the statement (no vendor KYC at Razorpay); Route later if vendor volume justifies it | Before the payments switch is turned on | `architecture.md` 6.7, ADR 0008 |
| Q38 | UI for admin order operations (mark delivered, collected, cancel, refund): portal admin pages calling the vendor-admin API, or something else? | Portal admin pages; SQLAdmin only for vendors, products, users, audit | Oct 22 | `05` section 6, `06` section 5 |
| Q39 | How is price staleness handled (a vendor changes a price a moment before a customer orders)? | Price changes publish immediately; orders store the catalog version; the app shows the final total before confirming; accept the short window | Oct 24 | `architecture.md` 7.3 |
| Q40 | How long is stock reserved for a cash or UPI on delivery order before the vendor confirms? | Until the confirmation window ends (4 business hours) plus the auto-cancel run; reserved stock is released on cancel | Oct 24 | `04` section 2 (`inventory`, `orders`) |
| Q41 | How is cash on delivery money collected from the courier and recorded? | Courier collects cash and remits to Shazlo; ops mark "payment collected" when the money arrives; statements use collected orders only | Oct 27 | `02` C6, `04` payouts |

## How to use this file

When a question is decided, record the answer next to it, update the affected document, and (for bigger choices) add an ADR in `adr/`.
