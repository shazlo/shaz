import os

from celery import Celery
from celery.signals import beat_init, worker_process_init

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.django.local")

app = Celery("shazlo")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


# Prefork children don't inherit the parent's exporter/log-listener threads,
# so each child sets up observability itself.
@worker_process_init.connect
def _init_worker(**_: object) -> None:
    from shazlo.core.observability import setup

    setup("shazlo-worker")


@beat_init.connect
def _init_beat(**_: object) -> None:
    from shazlo.core.observability import setup

    setup("shazlo-beat")
