from config.env import env

# Every integration is off unless explicitly enabled.

USE_MODAL = env.bool("USE_MODAL", default=False)
MODAL_EMBED_URL = env("MODAL_EMBED_URL", default="")
MODAL_TOKEN = env("MODAL_TOKEN", default="")

USE_RAZORPAY = env.bool("USE_RAZORPAY", default=False)
RAZORPAY_KEY_ID = env("RAZORPAY_KEY_ID", default="")
RAZORPAY_KEY_SECRET = env("RAZORPAY_KEY_SECRET", default="")
RAZORPAY_WEBHOOK_SECRET = env("RAZORPAY_WEBHOOK_SECRET", default="")

USE_WHATSAPP = env.bool("USE_WHATSAPP", default=False)
WHATSAPP_API_URL = env("WHATSAPP_API_URL", default="")
WHATSAPP_TOKEN = env("WHATSAPP_TOKEN", default="")

GOOGLE_OAUTH_CLIENT_IDS = env.list("GOOGLE_OAUTH_CLIENT_IDS", default=[])
