"""Shared pytest fixtures for every module's tests."""

from collections.abc import Callable
from typing import Any

import pytest
from django.test import Client

GraphQL = Callable[..., dict[str, Any]]


@pytest.fixture
def client() -> Client:
    return Client()


@pytest.fixture
def graphql(client: Client) -> GraphQL:
    """Run a GraphQL operation against /graphql and return the decoded JSON body.

    graphql("query { serverVersion }")
    graphql("mutation ($x: Int!) { ... }", variables={"x": 1}, token=access_token)
    """

    def run(
        query: str,
        variables: dict[str, Any] | None = None,
        token: str | None = None,
    ) -> dict[str, Any]:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = client.post(
            "/graphql",
            {"query": query, "variables": variables or {}},
            content_type="application/json",
            headers=headers,
        )
        if response.status_code not in (200, 400):
            pytest.fail(f"unexpected status {response.status_code}: {response.content!r}")
        body: dict[str, Any] = response.json()
        return body

    return run
