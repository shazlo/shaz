from django.conf import settings

from .logging import setup_logging
from .tracing import setup_tracing


def setup(service_name: str) -> None:
    """Per-process observability. Call after fork, from each entry point."""
    setup_logging(settings.LOG_LEVEL)
    setup_tracing(service_name)
