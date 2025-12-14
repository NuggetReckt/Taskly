def test_get_boards_empty(client):
    r = client.get("/boards")
    assert r.status_code == 200
    assert r.json() == {"boards_count": 0, "boards": []}


def test_create_board_then_get_boards(client):
    payload = {"owner_id": 1, "title": "Board A", "description": "Desc"}
    r = client.post("/board", json=payload)
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get("/boards")
    assert r.status_code == 200
    body = r.json()
    assert body["boards_count"] == 1
    assert body["boards"][0]["title"] == "Board A"


def test_get_board_404(client):
    r = client.get("/board/999")
    assert r.status_code == 404
    assert r.json()["detail"] == "Board not found"


def test_board_members_flow(client):
    # create board
    r = client.post("/board", json={"owner_id": 1, "title": "B", "description": "D"})
    assert r.status_code == 200

    board_id = client.get("/boards").json()["boards"][0]["id"]

    # initially empty
    r = client.get(f"/board/{board_id}/members")
    assert r.status_code == 200
    assert r.json() == {"members_count": 0, "members": []}

    # add member
    r = client.put(
        f"/board/{board_id}/member",
        json={"user_id": 42, "role": "member", "id": None, "board_id": None, "joined_at": None},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # list members
    r = client.get(f"/board/{board_id}/members")
    assert r.status_code == 200
    body = r.json()
    assert body["members_count"] == 1
    assert body["members"][0]["user_id"] == 42

    # remove member
    r = client.delete(f"/board/{board_id}/member", params={"user_id": 42})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # back to empty
    r = client.get(f"/board/{board_id}/members")
    assert r.status_code == 200
    assert r.json()["members_count"] == 0