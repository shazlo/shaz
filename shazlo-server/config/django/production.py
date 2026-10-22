from .base import *

DEBUG = False

# Cloudflare → Caddy → gunicorn: trust the proxy's scheme header.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env.int("DJANGO_SECURE_HSTS_SECONDS", default=60)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = False
SECURE_CONTENT_TYPE_NOSNIFF = True

# Preload is a one-way commitment; opt in deliberately once HTTPS is settled everywhere.
SILENCED_SYSTEM_CHECKS = ["security.W021"]

# Refuse to start with weak or missing secrets.
from django.core.exceptions import ImproperlyConfigured  # noqa: E402

for _name in ("JWT_SIGNING_KEY", "INTERNAL_HMAC_SECRET_INBOUND", "INTERNAL_HMAC_SECRET_OUTBOUND"):
    if len(globals()[_name]) < 32:
        raise ImproperlyConfigured(f"{_name} must be set to at least 32 characters in production")
if GRAPHQL_INTROSPECTION:
    raise ImproperlyConfigured("GraphQL introspection must be off in production")
