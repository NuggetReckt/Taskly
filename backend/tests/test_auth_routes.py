def test_register_then_login_success(client):
    # register (calls UsersRoutes.create_user under the hood)
    r = client.post(
        "/register",
        json={"email": "carol@example.com", "name": "Carol", "password": "pw123"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # login
    r = client.post(
        "/login", json={"email": "carol@example.com", "password": "pw123"}
    )
    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert isinstance(body["access_token"], str)
    assert len(body["access_token"]) > 10


def test_login_invalid_credentials_unknown_email(client):
    r = client.post("/login", json={"email": "nope@example.com", "password": "pw"})
    assert r.status_code == 200
    assert r.json()["status"] == "KO"
    assert r.json()["message"] == "Invalid credentials"


def test_api_key_required(client):
    # remove header and verify middleware blocks
    client.headers.pop("X-API-KEY", None)
    r = client.get("/users")
    assert r.status_code == 403
    assert r.json()["detail"].startswith("Forbidden")