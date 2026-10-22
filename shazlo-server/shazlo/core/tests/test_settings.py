import importlib
import sys

import pytest
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def test_jwt_is_scoped_to_core() -> None:
    assert settings.JWT_AUDIENCE == "core"
    assert settings.JWT_ALGORITHM == "HS256"
    assert settings.JWT_KEY_ID


def test_internal_defaults_are_safe() -> None:
    assert settings.INTERNAL_HMAC_MAX_SKEW_SECONDS == 60
    assert settings.INTERNAL_CALL_TIMEOUT_SECONDS == 3.0


def test_production_refuses_weak_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    for key in ("INTERNAL_HMAC_SECRET_INBOUND", "INTERNAL_HMAC_SECRET_OUTBOUND"):
        monkeypatch.setenv(key, "short")
    monkeypatch.setenv("DJANGO_ALLOWED_HOSTS", "api.shazlo.store")
    monkeypatch.delitem(sys.modules, "config.django.production", raising=False)
    with pytest.raises(ImproperlyConfigured):
        importlib.import_module("config.django.production")
