from config.env import env

# Two instances, because eviction policy is per instance:
#   state: noeviction + AOF  (feed queues, taste vectors, holds, refresh families, streams, broker)
#   cache: allkeys-lru       (anything rebuildable from Postgres)
REDIS_STATE_URL = env("REDIS_STATE_URL")
REDIS_CACHE_URL = env("REDIS_CACHE_URL")

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_CACHE_URL,
    }
}
