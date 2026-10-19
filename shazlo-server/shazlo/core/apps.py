from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "shazlo.core"

    def ready(self) -> None:
        # Logging only. Tracing is started per process from the entry points
        # (gunicorn post_fork, celery worker_process_init/beat_init, management
        # commands) because exporter threads don't survive a fork.
        from django.conf import settings

        from shazlo.core.observability.logging import setup_logging

        setup_logging(settings.LOG_LEVEL)
