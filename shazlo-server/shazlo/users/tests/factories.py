import factory
from factory.django import DjangoModelFactory

from shazlo.users.models import User


class UserFactory(DjangoModelFactory[User]):
    class Meta:
        model = User
        skip_postgeneration_save = True

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@example.test")

    @factory.post_generation
    def password(self, create: bool, extracted: str | None, **kwargs: object) -> None:
        self.set_password(extracted or "test-password-123")  # type: ignore[attr-defined]
        if create:
            self.save()  # type: ignore[attr-defined]
