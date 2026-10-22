from .base import *

DATABASES["default"]["OPTIONS"] = {}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
CELERY_TASK_ALWAYS_EAGER = True
OTEL_ENABLED = False
GRAPHQL_INTROSPECTION = True
