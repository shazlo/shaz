import strawberry
from django.conf import settings
from strawberry.extensions import MaxAliasesLimiter, QueryDepthLimiter

from shazlo.api.extensions import OperationSpanName


# Each app exposes its own Query/Mutation types in <app>/graphql.py; merge them
# here with strawberry.tools.merge_types as they appear.
@strawberry.type
class Query:
    @strawberry.field
    def server_version(self) -> str:
        return settings.APP_VERSION


schema = strawberry.Schema(
    query=Query,
    extensions=[
        OperationSpanName,
        lambda: QueryDepthLimiter(max_depth=10),
        lambda: MaxAliasesLimiter(max_alias_count=15),
    ],
)
