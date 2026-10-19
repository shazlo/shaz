from functools import cache

import redis
import redis.asyncio as aredis
from django.conf import settings


@cache
def state() -> redis.Redis:
    return redis.Redis.from_url(settings.REDIS_STATE_URL)


@cache
def cache_() -> redis.Redis:
    return redis.Redis.from_url(settings.REDIS_CACHE_URL)


@cache
def astate() -> aredis.Redis:
    return aredis.Redis.from_url(settings.REDIS_STATE_URL)


@cache
def acache() -> aredis.Redis:
    return aredis.Redis.from_url(settings.REDIS_CACHE_URL)
