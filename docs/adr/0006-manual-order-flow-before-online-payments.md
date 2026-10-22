# ADR 0006: Order requests with manual settlement before online payments

| | |
| --- | --- |
| Status | Accepted for the MVP |
| Date | 2026-10-19 |
| Related | `02-user-flows.md` flow C6, `04-database-design.md` section 2 (`orders`, `payments`), `06-mvp-slice-and-migration.md` section 7 |

## Context

Payments are switched off ("coming soon"). The current checkout cannot work safely: the phone sets the price, the order request does not match what the server reads, a verified payment is not tied to an order, and an order can be created without paying. The business model is commission only (no listing fee), delivery by a third party with WhatsApp updates for the first three to four months, and a launch in Ahmedabad. A full online payment flow (checkout session, webhook, refunds, stock holds) cannot be built and tested safely by Oct 30.

## Options

1. **Rebuild online payments with Razorpay now.** Highest value, highest risk for the deadline.
2. **Payment links shared by ops.** Manual and error-prone.
3. **Order request now, cash or UPI on delivery, commission settled manually; online payments after launch.**

## Decision

> **Amended 2026-10-20 (see `architecture.md` section 6.4 and ADR 0008).** The team wants online payments at launch, but the Razorpay business account is not approved. The launch path stays option 3 below. Online payments are now **built in Razorpay test mode behind a switch** (`online_payments_enabled`, a **Core** setting) and are turned on when the account is approved. Razorpay lives only in Core; the order flow, `payments` and `refunds` tables and the signed webhook are designed for it from the start.

Option 3.

- The customer places an order request with a payment method of `cod` or `upi_on_delivery`; payment status starts `pending`.
- The server prices every item from the database and snapshots the vendor's commission rate and amount on the order.
- The cart is split into one order per vendor (linked by `checkout_group_id`).
- Vendors confirm within a window; unconfirmed orders get reminders and are auto-cancelled; ops marks delivery and cash or UPI collected.
- Commission is settled by hand each month from a statement (no automatic payouts).
- Orders are accepted only for the launch pincodes.
- The `payments` and `refunds` tables and the `online` payment method already exist in the design so online payments plug in later.

## Consequences

- No stock reservation in the MVP, so two buyers can order the last item; the vendor cancels one.
- Cash handling, returns and refunds are manual and need clear ops steps.
- No payment risk or webhook surface at launch.

## Revisit when

Vendors or customers ask for online payment, cash collection becomes a problem, or the first two weeks of orders show how many are completed.
