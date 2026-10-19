# shazlo-server

Django 6 · Strawberry GraphQL (app) · Django Ninja REST (vendor portal, webhooks) · Postgres · Redis ×2 · Celery · Pinecone · R2 · OpenTelemetry.

## Run locally

```bash
cp .env.example .env
make up          # postgres, redis-state, redis-cache, minio, pinecone-local
make install     # uv sync + pre-commit
make migrate
make run         # http://localhost:8000/graphql (GraphiQL), /api/v1/docs, /admin/
make worker      # celery, separate terminal
```

`make test`, `make lint`, `make fmt`, `make typecheck`, `make schema`.

## Layout

```
config/            settings (django/{base,local,production,test}.py + settings/*.py), urls, asgi, celery
shazlo/core/       BaseModel, ApplicationError, redis clients, health, observability/
shazlo/api/        the edge: GraphQL schema, Ninja API, persisted queries. No business logic.
shazlo/<domain>/   users, auth, vendors, catalog, feed, orders
shazlo/integrations/  thin third-party clients (pinecone, modal, r2, razorpay, whatsapp, google)
deploy/            Dockerfile, prod compose, gunicorn, Caddy, Redis confs, OTel collector
```

## Conventions

| File | Role | Rule |
|---|---|---|
| `graphql.py` / `apis.py` / `webhooks.py` | controller | parse input, call a service/selector. No ORM, no Redis. |
| `services.py` | writes + business logic | `<entity>_<action>` (`order_place`). May call other domains' **services**, never their selectors/stores. |
| `selectors.py` | reads | `<entity>_<action>` (`product_list_for_feed`). |
| `store.py` | Redis repository | only where data lives in Redis (feed, auth, orders). |
| `tasks.py` | Celery | thin: load data, call a service. Must be idempotent (acks_late). Trigger with `transaction.on_commit`. |
| `models.py` | schema | extend `core.models.BaseModel` (uuid pk, timestamps). Constraints in the DB. |

- Expected errors: raise `ApplicationError(message, extra)`. Anything else is a 500 and gets reported.
- Integrations are off unless `USE_<X>=true`.
- The `auth` app's label is `shazlo_auth` (clashes with `django.contrib.auth` otherwise).

## Processes (one image)

| Role | Command |
|---|---|
| web | `gunicorn config.asgi:application -c deploy/gunicorn.conf.py` |
| worker | `celery -A config worker` |
| beat | `celery -A config beat` (exactly one) |
| consumer | `python manage.py consume_swipes` (compose profile `consumer`, off until implemented) |

## Observability

- Logs: structlog JSON on stdout through a `QueueHandler`, so the write happens on a listener thread. Every line carries `request_id`, `app_version`, `trace_id`/`span_id`. Sensitive keys are redacted.
- Traces/metrics: OTLP → `otel-collector` → backend. Set up **per process after fork** (gunicorn `post_fork`, celery `worker_process_init`/`beat_init`, command `handle()`), never at import time.
- The app sends 100% of traces; the collector's tail sampling keeps all errors, everything >500 ms, and 10% of the rest.

## GraphQL contract (client repo)

- `schema.graphql` is committed; CI fails if it is stale (`make schema`).
- CI runs graphql-inspector against `main` on PRs: no breaking changes. Deprecate, then remove once old app versions are gone.
- Release order: server first, then the app build that uses it.

## Deploy

Push to `main` → image `ghcr.io/<org>/shazlo-server:<sha>` → SSH to the VM → `migrate` → `up -d`.
The VM's `/srv/shazlo` holds `deploy/*` plus a `.env` (with `IMAGE=ghcr.io/<org>/shazlo-server`) and `certs/` (Cloudflare origin cert). Postgres is managed, not in compose.
