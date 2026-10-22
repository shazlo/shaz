from config.env import env

# Signed calls between Core and the vendor-admin service (docs/architecture.md section 5).
# One secret per direction. Empty means "not configured": production refuses to start without them.
INTERNAL_HMAC_SECRET_INBOUND = env(
    "INTERNAL_HMAC_SECRET_INBOUND", default=""
)  # vendor-admin -> core
INTERNAL_HMAC_SECRET_OUTBOUND = env(
    "INTERNAL_HMAC_SECRET_OUTBOUND", default=""
)  # core -> vendor-admin
INTERNAL_HMAC_MAX_SKEW_SECONDS = env.int("INTERNAL_HMAC_MAX_SKEW_SECONDS", default=60)
VENDOR_ADMIN_BASE_URL = env("VENDOR_ADMIN_BASE_URL", default="http://vendor:8001")
INTERNAL_CALL_TIMEOUT_SECONDS = env.float("INTERNAL_CALL_TIMEOUT_SECONDS", default=3.0)
