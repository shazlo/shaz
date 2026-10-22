# One image, four process roles: web, worker, beat, consumer (see docker-compose.prod.yml).
FROM python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --locked --no-dev
COPY . .

FROM python:3.13-slim
RUN useradd --create-home --uid 1000 app
WORKDIR /app
COPY --from=build --chown=app:app /app /app
ARG GIT_SHA=dev
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.django.production \
    APP_VERSION=$GIT_SHA
# Dummy values: collectstatic only needs settings to import.
RUN DJANGO_SECRET_KEY=build DATABASE_URL=postgres://x@localhost/x JWT_SIGNING_KEY=build \
    REDIS_STATE_URL=redis://localhost REDIS_CACHE_URL=redis://localhost CELERY_BROKER_URL=redis://localhost \
    python manage.py collectstatic --noinput
USER app
EXPOSE 8000
CMD ["gunicorn", "config.asgi:application", "-c", "deploy/gunicorn.conf.py"]
