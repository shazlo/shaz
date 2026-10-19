from django.conf import settings
from django.http import HttpRequest, HttpResponse
from ninja import NinjaAPI

from shazlo.catalog.apis import router as catalog_router
from shazlo.core.exceptions import ApplicationError
from shazlo.orders.webhooks import router as webhooks_router
from shazlo.vendors.apis import router as vendors_router

api = NinjaAPI(
    title="Shazlo",
    version="1",
    urls_namespace="api_v1",
    docs_url="/docs" if settings.DEBUG else None,
)

api.add_router("/vendors/", vendors_router)
api.add_router("/catalog/", catalog_router)
api.add_router("/webhooks/", webhooks_router)


@api.exception_handler(ApplicationError)
def application_error(request: HttpRequest, exc: ApplicationError) -> HttpResponse:
    return api.create_response(request, {"message": exc.message, "extra": exc.extra}, status=400)
