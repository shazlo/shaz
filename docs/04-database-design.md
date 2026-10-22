# 04. Database design: tables and indexes

| | |
| --- | --- |
| Status | Draft v1.1. The complete list of tables and indexes. Design rules, migration, Redis, personal data and the MVP delta are in `04b-database-notes.md` |
| Date | 2026-10-20 |

## 1. Overview

- **Two PostgreSQL databases** on one server: `shazlo_core` (35 tables, used by the Core service) and `shazlo_vendor` (23 tables, used by the Vendor-admin service). 58 tables in total.
- Every table has `id` (uuid) plus `created_at` and `updated_at`, except tables marked **bigint id** (append-only event tables) and tables whose primary key is named in the Columns cell.
- Money is stored in paise (`bigint`). Times are `timestamptz` (UTC).
- Foreign keys exist only inside one database. A column marked "(plain id)" points into the other database and has no foreign key.

## 2. Core database: `shazlo_core` (35 tables)

| # | Table | Columns | Indexes and constraints |
| --- | --- | --- | --- |
| 1 | `users` | email, phone, password, first_name, last_name, display_name, is_guest, is_active, is_staff, is_superuser, last_login, deleted_at | Unique lower(email) where not null; unique phone where not null; (is_guest, created_at) |
| 2 | `user_profiles` | **user_id (PK, FK users)**, gender, date_of_birth, language, marketing_opt_in, rewards_balance, total_swipes, total_likes | PK user_id |
| 3 | `addresses` | user_id (FK), recipient_name, phone, line1, line2, landmark, city, state, pincode, is_default | (user_id); unique (user_id) where is_default |
| 4 | `devices` | user_id (FK), platform, push_token, app_version, last_seen_at | Unique push_token; (user_id) |
| 5 | `social_identities` | user_id (FK), provider, subject, email_at_link | Unique (provider, subject) |
| 6 | `consents` | user_id (FK), kind, version, accepted_at | (user_id, kind) |
| 7 | `refresh_tokens` | family_id, user_id (FK), token_hash, expires_at, revoked_at, replaced_by | Unique token_hash; (family_id) |
| 8 | `catalog_items` | source, vendor_id (plain id), vendor_name, commission_bps, brand_name, title, description, category_slug, category_name, gender, fabric, attributes, min_price_paise, max_price_paise, images, variants, returnable, return_window_days, external_url, status, feed_eligible, version, source_updated_at | (category_slug, gender) where feed_eligible; (vendor_id); (status) |
| 9 | `product_embeddings` | **product_id (PK, FK catalog_items)**, model_version, embedding vector(512), source_image_url | PK product_id; **HNSW on embedding (cosine)** |
| 10 | `swipe_events` (bigint id) | user_id (FK), product_id (FK catalog_items), action, dwell_ms, session_id, slate_id, position, source, client_ts, idempotency_key | (user_id, id desc); (product_id, action); unique idempotency_key where not null |
| 11 | `user_taste_clusters` | user_id (FK), cluster_index, centroid vector(512), weight, updates_count | Unique (user_id, cluster_index) |
| 12 | `feed_impressions` (bigint id) | user_id (FK), product_id (FK), slate_id, position, served_at | (user_id, id desc) |
| 13 | `reward_events` (bigint id) | user_id (FK), kind, points, reason | (user_id, id desc) |
| 14 | `closets` | name, created_by (FK users) | (created_by) |
| 15 | `closet_members` | closet_id (FK), user_id (FK), role, joined_at | Unique (closet_id, user_id); (user_id) |
| 16 | `closet_items` | closet_id (FK), product_id (FK catalog_items), added_by (FK users), added_at | Unique (closet_id, product_id) |
| 17 | `closet_invites` | closet_id (FK), token, created_by (FK), expires_at, max_uses, uses, revoked_at | Unique token; (closet_id) |
| 18 | `carts` | user_id (FK) | Unique user_id |
| 19 | `cart_items` | cart_id (FK), variant_id (plain id), product_id (FK catalog_items), quantity | Unique (cart_id, variant_id); check quantity between 1 and 20 |
| 20 | `inventory` | **variant_id (PK, plain id)**, product_id (FK catalog_items), vendor_id (plain id), on_hand, reserved, version | PK variant_id; (product_id); (vendor_id); check on_hand >= 0, reserved >= 0, reserved <= on_hand |
| 21 | `stock_reservations` | order_id (FK orders), variant_id, quantity, status, expires_at | (order_id); (expires_at) where status = 'held' |
| 22 | `orders` | number, customer_id (FK users), vendor_id (plain id), checkout_group_id, status, payment_method, payment_status, subtotal_paise, delivery_fee_paise, discount_paise, total_paise, commission_bps, commission_paise, vendor_net_paise, price_versions, customer_name, customer_phone, address_snapshot, note, placed_at, payment_due_at, confirmation_due_at, reservation_expires_at, confirmed_at, shipped_at, delivered_at, cancelled_at, cancel_reason, idempotency_key, version | Unique number; unique (customer_id, idempotency_key); (vendor_id, status, placed_at); (customer_id, placed_at desc); (checkout_group_id); (status, confirmation_due_at) where status = 'placed'; (payment_due_at) where payment_status = 'pending' and payment_method = 'online' |
| 23 | `order_items` | order_id (FK), variant_id, product_id, title, sku, size, color, image_url, unit_price_paise, quantity, line_total_paise | (order_id) |
| 24 | `order_status_events` (bigint id) | order_id (FK), from_status, to_status, actor_type, actor_id, reason | (order_id, id) |
| 25 | `payments` | order_id (FK), method, provider, provider_order_id, provider_payment_id, amount_paise, status, captured_at, raw | Unique (provider_payment_id, order_id) where provider_payment_id is not null; (order_id); (provider_order_id) |
| 26 | `refunds` | payment_id (FK), order_id (FK), amount_paise, status, reason, provider_refund_id, processed_at | (order_id); (payment_id) |
| 27 | `deliveries` | order_id (FK), courier_name, tracking_ref, status, fee_paise | Unique order_id |
| 28 | `delivery_events` (bigint id) | delivery_id (FK), status, note, payload | (delivery_id, id) |
| 29 | `returns` | order_id (FK), status, reason, requested_by, decline_reason, resolved_at | (order_id) |
| 30 | `return_items` | return_id (FK), order_item_id (FK), quantity | (return_id) |
| 31 | `outbox_events` (bigint id) | event_id, type, aggregate_id, version, payload, status, attempts, next_attempt_at, sent_at | Unique event_id; (status, next_attempt_at) where status = 'pending' |
| 32 | `inbox_events` | **event_id (PK)**, type, aggregate_id, version, received_at, processed_at | PK event_id; (aggregate_id) |
| 33 | `idempotency_keys` | scope, key, request_hash, response | Unique (scope, key) |
| 34 | `notification_log` (bigint id) | user_id (FK), order_id (FK), channel, template, status, provider_message_id, error | (order_id, id); (user_id, id) |
| 35 | `audit_log` (bigint id) | actor_id, actor_type, action, entity_type, entity_id, before, after, ip, user_agent | (entity_type, entity_id, id); (actor_id, id) |

## 3. Vendor-admin database: `shazlo_vendor` (23 tables)

| # | Table | Columns | Indexes and constraints |
| --- | --- | --- | --- |
| 1 | `vendors` | name, slug, status, owner_name, phone, email, city, state, instagram_or_website, about, logo_key, declared_price_min_paise, declared_price_max_paise, product_types, source, commission_bps, agreement_signed_at, agreement_ref, gstin, reviewed_by, reviewed_at, rejection_reason | Unique slug; unique lower(email) where status in ('applied', 'under_review'); (status, created_at) |
| 2 | `commission_rates` | vendor_id (FK), commission_bps, effective_from, changed_by, reason | (vendor_id, effective_from desc) |
| 3 | `vendor_users` | vendor_id (FK), email, phone, password_hash, role, status, invited_at, accepted_at, last_login_at | Unique lower(email); unique phone where not null; (vendor_id); unique (vendor_id) where role = 'vendor_owner' |
| 4 | `admin_users` | email, name, password_hash, status, totp_secret, last_login_at | Unique lower(email) |
| 5 | `refresh_tokens` | family_id, subject_type, subject_id, token_hash, expires_at, revoked_at, replaced_by | Unique token_hash; (family_id) |
| 6 | `vendor_policies` | vendor_id (FK), returnable, return_window_days, return_shipping_paid_by, processing_hours, notes | Unique vendor_id |
| 7 | `vendor_locations` | vendor_id (FK), label, line1, line2, city, state, pincode, is_default | (vendor_id); unique (vendor_id) where is_default |
| 8 | `vendor_status_events` (bigint id) | vendor_id (FK), from_status, to_status, actor_id, reason | (vendor_id, id) |
| 9 | `categories` | parent_id (FK categories), name, slug, level | Unique slug; (parent_id) |
| 10 | `products` | vendor_id (FK), title, description, category_id (FK), gender, fabric, attributes, status, rejection_reason, returnable, return_window_days, weight_grams, min_price_paise, max_price_paise, version, published_at | (vendor_id, status); (status, created_at); (category_id) |
| 11 | `product_variants` | product_id (FK), vendor_id (FK), sku, size, color, price_paise, mrp_paise, is_active | Unique (product_id, size, color); unique (vendor_id, sku); check price_paise > 0, mrp_paise >= price_paise |
| 12 | `product_images` | product_id (FK), key, position, angle, width, height, alt_text | Unique (product_id, position) |
| 13 | `product_status_events` (bigint id) | product_id (FK), from_status, to_status, actor_type, actor_id, reason | (product_id, id) |
| 14 | `import_jobs` | vendor_id (FK), created_by (FK vendor_users), kind, status, file_key, total_rows, ok_rows, error_rows, errors, finished_at | (vendor_id, created_at) |
| 15 | `vendor_orders` | **order_id (PK, plain id)**, number, vendor_id (FK), customer_id (plain id), status, payment_method, payment_status, subtotal_paise, delivery_fee_paise, total_paise, commission_bps, commission_paise, vendor_net_paise, customer_name, customer_phone, address_snapshot, placed_at, confirmation_due_at, confirmed_at, shipped_at, delivered_at, cancelled_at, cancel_reason, version | PK order_id; unique number; (vendor_id, status, placed_at); (customer_id) |
| 16 | `vendor_order_items` | order_id (FK vendor_orders), product_id, variant_id, title, size, color, image_url, unit_price_paise, quantity | (order_id) |
| 17 | `vendor_payouts` | vendor_id (FK), period_start, period_end, orders_count, gross_paise, commission_paise, net_paise, status, paid_at, reference | Unique (vendor_id, period_start, period_end) |
| 18 | `payout_lines` | payout_id (FK), order_id (FK vendor_orders), gross_paise, commission_paise, net_paise | Unique order_id; (payout_id) |
| 19 | `outbox_events` (bigint id) | event_id, type, aggregate_id, version, payload, status, attempts, next_attempt_at, sent_at | Unique event_id; (status, next_attempt_at) where status = 'pending' |
| 20 | `inbox_events` | **event_id (PK)**, type, aggregate_id, version, received_at, processed_at | PK event_id; (aggregate_id) |
| 21 | `idempotency_keys` | scope, key, request_hash, response | Unique (scope, key) |
| 22 | `vendor_notification_log` (bigint id) | vendor_id (FK), order_id (plain id), channel, template, status, provider_message_id, error | (order_id, id); (vendor_id, id) |
| 23 | `audit_log` (bigint id) | actor_id, actor_type, action, entity_type, entity_id, before, after, ip, user_agent | (entity_type, entity_id, id); (actor_id, id) |

## 4. Enumerations

| Name | Values | Database |
| --- | --- | --- |
| Gender (profile) | `women`, `men`, `other`, `unspecified` | core |
| Product gender | `women`, `men`, `unisex` | both |
| Catalog item source | `vendor`, `scraped` | core |
| Catalog item status | `approved`, `hidden` | core |
| Vendor status | `applied`, `under_review`, `approved`, `rejected`, `suspended` | vendor |
| Vendor user role | `vendor_owner`, `vendor_staff` | vendor |
| Product status | `draft`, `pending_review`, `approved`, `rejected`, `archived` | vendor |
| Order status | `placed`, `confirmed`, `shipped`, `delivered`, `cancelled`, `return_requested`, `returned`, `refunded` | core, vendor (copy) |
| Payment method | `cod`, `upi_on_delivery`, `online` | core, vendor (copy) |
| Payment status | `pending`, `paid`, `failed`, `refunded` | core, vendor (copy) |
| Reservation status | `held`, `committed`, `released` | core |
| Swipe action | `like`, `dislike`, `save`, `cart`, `order` | core |
| Closet member role | `owner`, `editor` | core |
| Event type | `product.published`, `product.updated`, `product.unpublished`, `vendor.status_changed`, `vendor.commission_changed`, `order.placed`, `order.status_changed`, `payment.captured`, `payment.refunded`, `order.confirmation_overdue`, `customer.deleted` | both |
