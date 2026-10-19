import logging
import logging.handlers
import os
import queue
import sys
from collections.abc import MutableMapping
from typing import Any

import structlog
from opentelemetry import trace

REDACT = frozenset({"phone", "address", "email", "token", "password", "razorpay_signature"})

_listener: logging.handlers.QueueListener | None = None
_pid: int | None = None


def _trace_ids(_: Any, __: str, event: MutableMapping[str, Any]) -> MutableMapping[str, Any]:
    ctx = trace.get_current_span().get_span_context()
    if ctx.is_valid:
        event["trace_id"] = format(ctx.trace_id, "032x")
        event["span_id"] = format(ctx.span_id, "016x")
    return event


def _redact(_: Any, __: str, event: MutableMapping[str, Any]) -> MutableMapping[str, Any]:
    for key in REDACT & event.keys():
        event[key] = "[redacted]"
    return event


SHARED: list[structlog.typing.Processor] = [
    structlog.contextvars.merge_contextvars,
    structlog.stdlib.add_log_level,
    structlog.stdlib.add_logger_name,
    structlog.processors.TimeStamper(fmt="iso", utc=True),
    _trace_ids,
    _redact,
]


def setup_logging(level: str = "INFO") -> None:
    """JSON logs to stdout. The request thread only renders; a listener thread
    does the (possibly blocking) write. Idempotent per process: after a fork the
    listener thread is gone, so a new pid re-runs setup."""
    global _listener, _pid
    if _pid == os.getpid():
        return

    # ponytail: unbounded queue; bound it (drop DEBUG first) if stdout ever stalls for long
    q: queue.SimpleQueue = queue.SimpleQueue()
    # Render on the caller thread: contextvars and the current span only exist there,
    # and QueueHandler.prepare() would otherwise stringify structlog's event dict.
    handler = logging.handlers.QueueHandler(q)
    handler.setFormatter(
        structlog.stdlib.ProcessorFormatter(
            foreign_pre_chain=SHARED,  # django/celery/gunicorn records get the same shape
            processors=[
                structlog.stdlib.ProcessorFormatter.remove_processors_meta,
                structlog.processors.dict_tracebacks,
                structlog.processors.JSONRenderer(),
            ],
        )
    )
    _listener = logging.handlers.QueueListener(q, logging.StreamHandler(sys.stdout))
    _listener.start()

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
    # Server loggers ship their own plain-text handlers; route them through root instead.
    for name in ("gunicorn.error", "gunicorn.access", "uvicorn", "uvicorn.error", "uvicorn.access"):
        server_logger = logging.getLogger(name)
        server_logger.handlers = []
        server_logger.propagate = True

    structlog.configure(
        processors=[*SHARED, structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    _pid = os.getpid()


def stop_logging() -> None:
    """Flush queued records. Call on graceful shutdown."""
    if _listener is not None:
        _listener.stop()
