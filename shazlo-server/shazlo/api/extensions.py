from collections.abc import Iterator

from opentelemetry import trace
from strawberry.extensions import SchemaExtension


class OperationSpanName(SchemaExtension):
    """Every request is POST /graphql; rename the request span to the operation
    so traces are searchable. Deliberately no per-resolver spans."""

    def on_execute(self) -> Iterator[None]:
        name = self.execution_context.operation_name or "anonymous"
        span = trace.get_current_span()
        span.update_name(f"graphql {name}")
        span.set_attribute("graphql.operation.name", name)
        yield
