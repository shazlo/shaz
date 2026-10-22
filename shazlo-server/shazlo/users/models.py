from django.contrib.auth.models import AbstractUser

from shazlo.core.models import BaseModel


class User(BaseModel, AbstractUser):
    """Custom user from day one: swapping AUTH_USER_MODEL after the first
    migration is painful. Profile fields get added here later."""
