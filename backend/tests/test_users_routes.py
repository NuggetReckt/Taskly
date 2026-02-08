import bcrypt


def test_get_users_empty(client):
    r = client.get("/users")
    assert r.status_code == 200
    body = r.json()
    assert body["users_count"] == 0
    assert body["users"] == []


def test_create_user_then_get_user(client):
    # Create
    payload = {
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Batart",
        "avatar_url": None,
        "password": "plaintext-password",
    }
    r = client.post("/user", json=payload)
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # List
    r = client.get("/users")
    assert r.status_code == 200
    body = r.json()
    assert body["users_count"] == 1
    assert body["users"][0]["email"] == "alice@example.com"
    assert body["users"][0]["first_name"] == "Alice"
    assert body["users"][0]["last_name"] == "Batart"

    # Get by id
    user_id = body["users"][0]["id"]
    r = client.get(f"/user/{user_id}")
    assert r.status_code == 200
    assert r.json()["email"] == "alice@example.com"


def test_create_user_conflict_same_email(client):
    payload = {
        "email": "dup@example.com",
        "first_name": "Dup",
        "last_name": "Licate",
        "avatar_url": None,
        "password": "pw",
    }
    r1 = client.post("/user", json=payload)
    assert r1.status_code == 200

    r2 = client.post("/user", json=payload)
    assert r2.status_code == 409
    assert r2.json()["detail"] == "User already exists"


def test_update_user_404(client):
    payload = {
        "id": 999,
        "email": "nobody@example.com",
        "first_name": "Nobody",
        "last_name": "None",
        "avatar_url": None,
        "password_hash": "pw",
        "created_at": None,
    }
    r = client.put("/user/999", json=payload)
    assert r.status_code == 404
    assert r.json()["detail"] == "User not found"


def test_update_user_success(client, fake_db):
    # Insert a user directly in fake DB so we control password_hash format
    pw_hash = bcrypt.hashpw(b"pw", bcrypt.gensalt()).decode("utf-8")
    fake_db.execute(
        "INSERT INTO users (email, first_name, last_name, avatar_url, password_hash) VALUES (%s, %s, %s, %s, %s)",
        ("bob@example.com", "Bob", "2", None, pw_hash),
    )

    r_list = client.get("/users")
    user_id = r_list.json()["users"][0]["id"]

    payload = {
        "id": user_id,
        "email": "bob2@example.com",
        "first_name": "Bob",
        "last_name": "2",
        "avatar_url": "https://example.com/a.png",
        "password_hash": pw_hash,
        "created_at": None,
    }
    r = client.put(f"/user/{user_id}", json=payload)
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r_get = client.get(f"/user/{user_id}")
    assert r_get.status_code == 200
    assert r_get.json()["email"] == "bob2@example.com"
    assert r_get.json()["first_name"] == "Bob"
    assert r_get.json()["last_name"] == "2"