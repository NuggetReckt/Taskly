def test_get_boards_empty(client):
    r = client.get("/boards")
    assert r.status_code == 200
    assert r.json() == {"boards_count": 0, "boards": []}


def test_create_board_then_get_boards(client):
    payload = {"owner_id": 1, "title": "Board A", "description": "Desc"}
    r = client.post("/board", json=payload)
    assert r.status_code == 200
    assert r.json()["id"] == 1

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
    # create owner
    client.post("/user", json={"email": "owner@t.com", "first_name": "O", "last_name": "W", "password": "p", "avatar_url": ""})
    owner_id = 1

    # create users
    client.post("/user", json={"email": "u1@t.com", "first_name": "U", "last_name": "1", "password": "p", "avatar_url": ""})
    u1_id = 2
    client.post("/user", json={"email": "u2@t.com", "first_name": "U", "last_name": "2", "password": "p", "avatar_url": ""})
    u2_id = 3

    # create board
    r = client.post("/board", json={"owner_id": owner_id, "title": "B", "description": "D"})
    assert r.status_code == 200
    board_id = r.json()["id"]

    # initially empty
    r = client.get(f"/board/{board_id}/members")
    assert r.status_code == 200
    assert r.json() == {"members_count": 0, "members": []}

    # add member (success)
    r = client.put(
        f"/board/{board_id}/member",
        json={"user_id": u1_id, "role": "editor"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # add member (duplicate) - should fail
    r = client.put(
        f"/board/{board_id}/member",
        json={"user_id": u1_id, "role": "editor"},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "User is already a member of this board"

    # add board owner as member - should fail
    r = client.put(
        f"/board/{board_id}/member",
        json={"user_id": owner_id, "role": "editor"},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "User is the board owner"

    # add member with invalid role - should fail
    r = client.put(
        f"/board/{board_id}/member",
        json={"user_id": u2_id, "role": "invalid_role"},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Invalid role"

    # remove member (not a member) - should fail
    r = client.delete(f"/board/{board_id}/member", params={"user_id": u2_id})
    assert r.status_code == 404
    assert r.json()["detail"] == "User is not a member of this board"

    # remove member (success)
    r = client.delete(f"/board/{board_id}/member", params={"user_id": u1_id})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # back to empty
    r = client.get(f"/board/{board_id}/members")
    assert r.status_code == 200
    assert r.json()["members_count"] == 0


def test_board_labels_flow(client):
    # create board
    client.post("/board", json={"owner_id": 1, "title": "B", "description": "D"})
    board_id = client.get("/boards").json()["boards"][0]["id"]

    # initially empty
    r = client.get(f"/board/{board_id}/labels")
    assert r.status_code == 200
    assert r.json() == []

    # add label
    label_payload = {"name": "Bug", "color": "red"}
    r = client.post(f"/board/{board_id}/label", json=label_payload)
    assert r.status_code == 200
    label_id = r.json()["id"]

    # list labels
    r = client.get(f"/board/{board_id}/labels")
    assert len(r.json()) == 1
    assert r.json()[0]["name"] == "Bug"

    # get label
    r = client.get(f"/board/{board_id}/label/{label_id}")
    assert r.status_code == 200
    assert r.json()["name"] == "Bug"

    # edit label
    r = client.put(f"/board/{board_id}/label/{label_id}", json={"name": "Critical", "color": "darkred"})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/label/{label_id}")
    assert r.json()["name"] == "Critical"

    # remove label
    r = client.delete(f"/board/{board_id}/label/{label_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # back to empty
    r = client.get(f"/board/{board_id}/labels")
    assert len(r.json()) == 0


def test_board_lists_flow(client):
    # create board
    client.post("/board", json={"owner_id": 1, "title": "B", "description": "D"})
    board_id = client.get("/boards").json()["boards"][0]["id"]

    # initially empty
    r = client.get(f"/board/{board_id}/lists")
    assert r.status_code == 200
    assert r.json() == []

    # add list
    list_payload = {"title": "Todo", "position": 1}
    r = client.post(f"/board/{board_id}/list", json=list_payload)
    assert r.status_code == 200
    list_id = r.json()["id"]

    # list lists
    r = client.get(f"/board/{board_id}/lists")
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Todo"

    # get list
    r = client.get(f"/board/{board_id}/list/{list_id}")
    assert r.status_code == 200
    assert r.json()["title"] == "Todo"

    # update list
    r = client.put(f"/board/{board_id}/list/{list_id}", json={"title": "In Progress", "position": 1})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/list/{list_id}")
    assert r.json()["title"] == "In Progress"

    # remove list
    r = client.delete(f"/board/{board_id}/list/{list_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # back to empty
    r = client.get(f"/board/{board_id}/lists")
    assert len(r.json()) == 0


def test_board_cards_flow(client):
    # create board
    client.post("/board", json={"owner_id": 1, "title": "B", "description": "D"})
    board_id = client.get("/boards").json()["boards"][0]["id"]

    # create list
    r = client.post(f"/board/{board_id}/list", json={"title": "Todo", "position": 1})
    list_id = r.json()["id"]

    # initially empty cards
    r = client.get(f"/board/{board_id}/cards")
    assert r.status_code == 200
    assert r.json() == []

    # add card
    card_payload = {"title": "Task 1", "description": "Do it", "position": 1, "list_id": list_id}
    r = client.post(f"/board/{board_id}/card", json=card_payload)
    assert r.status_code == 200
    card_id = r.json()["id"]

    # list cards
    r = client.get(f"/board/{board_id}/cards")
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Task 1"

    # get card
    r = client.get(f"/board/{board_id}/card/{card_id}")
    assert r.status_code == 200
    assert r.json()["title"] == "Task 1"

    # edit card
    r = client.put(f"/board/{board_id}/card/{card_id}", json={"title": "Task 1 Updated", "description": "Done", "position": 1, "list_id": list_id})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/card/{card_id}")
    assert r.json()["title"] == "Task 1 Updated"

    # assignees flow
    # list assignees (initially empty)
    r = client.get(f"/board/{board_id}/card/{card_id}/assignees")
    assert r.status_code == 200
    assert r.json() == []

    # create user
    client.post("/user", json={"email": "test@example.com", "first_name": "T", "last_name": "E", "avatar_url": "", "password": "pass"})
    user_id = client.get("/users").json()["users"][0]["id"]

    # add assignee
    r = client.post(f"/board/{board_id}/card/{card_id}/assignee/{user_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/card/{card_id}/assignees")
    assert len(r.json()) == 1
    assert r.json()[0] == user_id

    # remove assignee
    r = client.delete(f"/board/{board_id}/card/{card_id}/assignee/{user_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/card/{card_id}/assignees")
    assert len(r.json()) == 0

    # labels flow
    # list card labels (initially empty)
    r = client.get(f"/board/{board_id}/card/{card_id}/labels")
    assert r.status_code == 200
    assert r.json() == []

    # create board label
    r = client.post(f"/board/{board_id}/label", json={"name": "Urgent", "color": "red"})
    label_id = r.json()["id"]

    # add label to card
    r = client.post(f"/board/{board_id}/card/{card_id}/label/{label_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/card/{card_id}/labels")
    assert len(r.json()) == 1
    assert r.json()[0] == label_id

    # remove label from card
    r = client.delete(f"/board/{board_id}/card/{card_id}/label/{label_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}/card/{card_id}/labels")
    assert len(r.json()) == 0

    # remove card
    r = client.delete(f"/board/{board_id}/card/{card_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    # back to empty
    r = client.get(f"/board/{board_id}/cards")
    assert len(r.json()) == 0


def test_transfer_board_ownership(client):
    client.post("/user", json={"email": "owner@t.com", "first_name": "Owner", "last_name": "User", "password": "p", "avatar_url": ""})
    client.post("/user", json={"email": "member@t.com", "first_name": "Member", "last_name": "User", "password": "p", "avatar_url": ""})
    owner_id = 1
    member_id = 2

    r = client.post("/board", json={"owner_id": owner_id, "title": "B", "description": "D"})
    board_id = r.json()["id"]

    client.put(f"/board/{board_id}/member", json={"user_id": member_id, "role": "editor"})

    r = client.put(f"/board/{board_id}/ownership", json={"new_owner_id": member_id})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.get(f"/board/{board_id}")
    assert r.status_code == 200
    assert r.json()["owner_id"] == member_id

    r = client.get(f"/board/{board_id}/members")
    assert r.status_code == 200
    owner_member = next(m for m in r.json()["members"] if m["user_id"] == owner_id)
    assert owner_member["role"] == "admin"


def test_archive_board_makes_it_read_only(client):
    client.post("/user", json={"email": "owner@t.com", "first_name": "Owner", "last_name": "User", "password": "p", "avatar_url": ""})
    owner_id = 1

    r = client.post("/board", json={"owner_id": owner_id, "title": "B", "description": "D"})
    board_id = r.json()["id"]

    r = client.put(f"/board/{board_id}/status", json={"board_status": "archived"})
    assert r.status_code == 200
    assert r.json()["status"] == "OK"

    r = client.put(f"/board/{board_id}", json={"title": "Updated", "description": "Updated"})
    assert r.status_code == 400
    assert r.json()["detail"] == "Board is archived and read-only"

    r = client.post(f"/board/{board_id}/label", json={"name": "Blocked", "color": "#ff0000"})
    assert r.status_code == 400
    assert r.json()["detail"] == "Board is archived and read-only"
