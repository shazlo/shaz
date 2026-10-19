from django.db import connection
from django.http import HttpRequest, JsonResponse

from shazlo.core import redis


def healthz(request: HttpRequest) -> JsonResponse:
    """Liveness: the process is up. Never touches dependencies."""
    return JsonResponse({"status": "ok"})


def readyz(request: HttpRequest) -> JsonResponse:
    """Readiness: Postgres and redis-state are reachable."""
    checks = {}
    try:
        connection.ensure_connection()
        checks["postgres"] = "ok"
    except Exception:
        checks["postgres"] = "unavailable"
    try:
        redis.state().ping()
        checks["redis_state"] = "ok"
    except Exception:
        checks["redis_state"] = "unavailable"
    ok = all(v == "ok" for v in checks.values())
    return JsonResponse({"status": "ok" if ok else "degraded", **checks}, status=200 if ok else 503)
