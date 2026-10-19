import multiprocessing
import os

bind = "0.0.0.0:8000"
worker_class = "uvicorn_worker.UvicornWorker"
workers = int(os.environ.get("WEB_CONCURRENCY", multiprocessing.cpu_count()))
timeout = 30
graceful_timeout = 30
keepalive = 5
max_requests = 2000  # recycle workers to cap slow memory growth
max_requests_jitter = 200
accesslog = None  # request logging comes from Django/OTel, not gunicorn
# preload_app stays off: Django must load after post_fork so instrumentation lands first.


def on_starting(server):  # noqa: ARG001
    from shazlo.core.observability.logging import setup_logging

    setup_logging(os.environ.get("LOG_LEVEL", "INFO"))


def post_fork(server, worker):  # noqa: ARG001
    from shazlo.core.observability import setup

    setup("shazlo-web")


def worker_exit(server, worker):  # noqa: ARG001
    from shazlo.core.observability.logging import stop_logging

    stop_logging()
