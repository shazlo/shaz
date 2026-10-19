from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()

if (BASE_DIR / ".env").exists():
    environ.Env.read_env(BASE_DIR / ".env")
