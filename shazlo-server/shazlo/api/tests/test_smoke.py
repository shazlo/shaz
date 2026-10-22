from django.test import Client

from conftest import GraphQL


def test_healthz() -> None:
    response = Client().get("/healthz")
    assert response.status_code == 200
    assert response.headers["X-Request-Id"]


def test_graphql_server_version(graphql: GraphQL) -> None:
    assert graphql("query Version { serverVersion }") == {"data": {"serverVersion": "dev"}}


def test_graphql_alias_limit(graphql: GraphQL) -> None:
    body = graphql("{ " + "a: serverVersion " * 20 + "}")
    assert "errors" in body


def test_graphql_depth_limit(graphql: GraphQL) -> None:
    deep = "{ __schema { types { " + "fields { type { " * 8 + "name" + " } }" * 8 + " } } }"
    body = graphql(deep)
    assert "errors" in body
