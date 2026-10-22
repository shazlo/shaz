from config.env import env

# Mobile clients don't need CORS; this is for the vendor portal / website.
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
