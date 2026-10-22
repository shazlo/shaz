from datetime import timedelta

from config.env import env

JWT_SIGNING_KEY = env("JWT_SIGNING_KEY")
JWT_KEY_ID = env("JWT_KEY_ID", default="k1")
# Previous keys verify only, so a key can rotate without logging everyone out.
JWT_PREVIOUS_SIGNING_KEYS: list[str] = env.list("JWT_PREVIOUS_SIGNING_KEYS", default=[])
JWT_ALGORITHM = "HS256"
# Core tokens are valid for Core only; the vendor-admin service issues its own ("vendor").
JWT_AUDIENCE = "core"
JWT_ISSUER = env("JWT_ISSUER", default="shazlo-core")
JWT_ACCESS_TTL = timedelta(minutes=env.int("JWT_ACCESS_TTL_MINUTES", default=15))
JWT_REFRESH_TTL = timedelta(days=env.int("JWT_REFRESH_TTL_DAYS", default=30))
