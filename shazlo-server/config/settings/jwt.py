from datetime import timedelta

from config.env import env

JWT_SIGNING_KEY = env("JWT_SIGNING_KEY")
JWT_ACCESS_TTL = timedelta(minutes=env.int("JWT_ACCESS_TTL_MINUTES", default=15))
JWT_REFRESH_TTL = timedelta(days=env.int("JWT_REFRESH_TTL_DAYS", default=30))
