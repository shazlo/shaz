import uuid
from collections.abc import Callable

import structlog
from asgiref.sync import iscoroutinefunction
from django.http import HttpRequest, HttpResponse
from django.utils.decorators import sync_and_async_middleware


def _bind(request: HttpRequest) -> str:
    structlog.contextvars.clear_contextvars()
    request_id = request.headers.get("X-Request-Id") or uuid.uuid4().hex
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        app_version=request.headers.get("X-App-Version"),
    )
    return request_id


@sync_and_async_middleware
def request_context(get_response: Callable) -> Callable:
    """Binds request_id / app_version into every log line for this request.
    user_id is bound by the auth middleware once it exists."""
    if iscoroutinefunction(get_response):

        async def amiddleware(request: HttpRequest) -> HttpResponse:
            request_id = _bind(request)
            response = await get_response(request)
            response["X-Request-Id"] = request_id
            return response

        return amiddleware

    def middleware(request: HttpRequest) -> HttpResponse:
        request_id = _bind(request)
        response = get_response(request)
        response["X-Request-Id"] = request_id
        return response

    return middleware
