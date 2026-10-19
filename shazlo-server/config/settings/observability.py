from config.env import env

ENVIRONMENT = env("ENVIRONMENT", default="local")
APP_VERSION = env("APP_VERSION", default="dev")
LOG_LEVEL = env("LOG_LEVEL", default="INFO")

# Exporter endpoint/headers come from the standard OTEL_EXPORTER_OTLP_* env vars.
OTEL_ENABLED = env.bool("OTEL_ENABLED", default=False)
# Send everything to the collector; tail sampling there decides what to keep
# (head-sampling here would drop errors before the collector could see them).
OTEL_SAMPLE_RATIO = env.float("OTEL_SAMPLE_RATIO", default=1.0)
