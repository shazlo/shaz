class ApplicationError(Exception):
    """Expected business error. Rendered as {message, extra} by Ninja and as a
    GraphQL error with extensions by Strawberry. Anything else is a 500."""

    def __init__(self, message: str, extra: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.extra = extra or {}
