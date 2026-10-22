SETTINGS ?= config.django.local
export DJANGO_SETTINGS_MODULE := $(SETTINGS)

.PHONY: install up down run worker beat migrate migrations shell test lint fmt typecheck schema

install:     ## deps + pre-commit hooks
	uv sync
	uv run pre-commit install || true

up:          ## local infra
	docker compose up -d

down:
	docker compose down

run:         ## ASGI dev server with reload
	uv run uvicorn config.asgi:application --reload --port 8000

worker:
	uv run celery -A config worker --loglevel=INFO

beat:
	uv run celery -A config beat --loglevel=INFO

migrate:
	uv run python manage.py migrate

migrations:
	uv run python manage.py makemigrations

shell:
	uv run python manage.py shell

test:
	uv run pytest

lint:
	uv run ruff check .
	uv run ruff format --check .
	uv run lint-imports

fmt:
	uv run ruff check --fix .
	uv run ruff format .

typecheck:
	uv run mypy .

schema:      ## export GraphQL schema for the client repo + breaking-change check
	uv run python manage.py export_schema shazlo.api.schema --path schema.graphql
