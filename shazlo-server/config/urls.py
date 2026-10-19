from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from strawberry.django.views import AsyncGraphQLView

from shazlo.api.ninja import api
from shazlo.api.schema import schema
from shazlo.core.health import healthz, readyz

urlpatterns = [
    path(
        "graphql",
        csrf_exempt(
            AsyncGraphQLView.as_view(
                schema=schema, graphql_ide="graphiql" if settings.DEBUG else None
            )
        ),
    ),
    path("api/v1/", api.urls),
    path(settings.ADMIN_URL, admin.site.urls),
    path("healthz", healthz),
    path("readyz", readyz),
]
