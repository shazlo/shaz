from collections.abc import Callable

import strawberry
from django.conf import settings
from strawberry.extensions import DisableIntrospection, MaxAliasesLimiter, QueryDepthLimiter
from strawberry.extensions.base_extension import SchemaExtension

from shazlo.api.extensions import OperationSpanName


# Each app exposes its own Query/Mutation types in <app>/graphql.py; merge them
# here with strawberry.tools.merge_types as they appear.
@strawberry.type
class Query:
    @strawberry.field
    def server_version(self) -> str:
        return settings.APP_VERSION


def build_schema(*, introspection: bool) -> strawberry.Schema:
    extensions: list[type[SchemaExtension] | Callable[[], SchemaExtension]] = [
        OperationSpanName,
        lambda: QueryDepthLimiter(max_depth=10),
        lambda: MaxAliasesLimiter(max_alias_count=15),
    ]
    if not introspection:
        extensions.append(lambda: DisableIntrospection())
    return strawberry.Schema(query=Query, extensions=extensions)


schema = build_schema(introspection=settings.GRAPHQL_INTROSPECTION)
