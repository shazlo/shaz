from config.env import env

# Broker lives on redis-state (noeviction): queued tasks must never be evicted.
CELERY_BROKER_URL = env("CELERY_BROKER_URL")
CELERY_BROKER_TRANSPORT_OPTIONS = {"visibility_timeout": 3600}
CELERY_TASK_IGNORE_RESULT = True
# acks_late + reject_on_worker_lost: a crashed task is redelivered, so tasks must be idempotent.
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_WORKER_HIJACK_ROOT_LOGGER = False
CELERY_TIMEZONE = "Asia/Kolkata"
CELERY_BEAT_SCHEDULE: dict = {}
