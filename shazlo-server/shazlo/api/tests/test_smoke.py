from django.test import Client


def test_healthz() -> None:
    response = Client().get("/healthz")
    assert response.status_code == 200
    assert response.headers["X-Request-Id"]


def test_graphql_server_version() -> None:
    response = Client().post(
        "/graphql",
        {"query": "query Version { serverVersion }"},
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"data": {"serverVersion": "dev"}}


def test_graphql_depth_limit() -> None:
    response = Client().post(
        "/graphql",
        {"query": "{ " + "a: serverVersion " * 20 + "}"},
        content_type="application/json",
    )
    assert "errors" in response.json()
