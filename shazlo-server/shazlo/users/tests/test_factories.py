import pytest

from shazlo.users.models import User
from shazlo.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_user_factory_creates_a_row_in_postgres() -> None:
    user = UserFactory.create()
    assert User.objects.filter(pk=user.pk).exists()
    assert user.check_password("test-password-123")


@pytest.mark.django_db
def test_user_factory_usernames_are_unique() -> None:
    first, second = UserFactory.create(), UserFactory.create()
    assert first.username != second.username
