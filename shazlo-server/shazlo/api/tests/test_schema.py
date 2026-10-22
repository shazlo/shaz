from shazlo.api.schema import build_schema

INTROSPECTION_QUERY = "{ __schema { queryType { name } } }"


def test_introspection_can_be_switched_off() -> None:
    allowed = build_schema(introspection=True).execute_sync(INTROSPECTION_QUERY)
    assert allowed.errors is None
    blocked = build_schema(introspection=False).execute_sync(INTROSPECTION_QUERY)
    assert blocked.errors
