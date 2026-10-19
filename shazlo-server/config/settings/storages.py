from config.env import env

# Cloudflare R2 (S3 API). MinIO stands in locally.
USE_R2 = env.bool("USE_R2", default=False)
R2_ENDPOINT_URL = env("R2_ENDPOINT_URL", default="")
R2_ACCESS_KEY_ID = env("R2_ACCESS_KEY_ID", default="")
R2_SECRET_ACCESS_KEY = env("R2_SECRET_ACCESS_KEY", default="")
R2_BUCKET = env("R2_BUCKET", default="shazlo")
R2_PUBLIC_BASE_URL = env("R2_PUBLIC_BASE_URL", default="")
