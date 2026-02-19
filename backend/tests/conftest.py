import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


class FakeDatabaseHandler:
    """
    Very small in-memory DB that supports just the SQL shapes used by your routes.
    It is intentionally minimal: if a new query appears, tests will fail loudly.
    """

    def __init__(self):
        self._connected = False

        self._users = []
        self._boards = []
        self._board_members = []
        self._labels = []
        self._lists = []
        self._cards = []
        self._card_labels = []
        self._card_assignees = []

        self._user_id_seq = 1
        self._board_id_seq = 1
        self._board_member_id_seq = 1
        self._label_id_seq = 1
        self._list_id_seq = 1
        self._card_id_seq = 1

    def connect(self):
        self._connected = True

    def disconnect(self):
        self._connected = False

    def is_connected(self):
        return self._connected

    def execute(self, query: str, params=None):
        q = " ".join(query.split()).strip().lower()

        # Normalize params behavior similar-ish to psycopg wrapper
        if params is not None and not isinstance(params, (list, tuple, dict)):
            params = (params,)

        # ---------- USERS ----------
        if q == "select * from users":
            return list(self._users)

        if q.startswith("select * from users where id = %s"):
            user_id = params[0]
            return [u for u in self._users if u["id"] == user_id]

        if q.startswith("select * from users where email = %s"):
            email = params[0]
            return [u for u in self._users if u["email"] == email]

        if q.startswith("insert into users (email, first_name, last_name, avatar_url, password_hash) values (%s, %s, %s, %s, %s)"):
            email, first_name, last_name, avatar_url, password_hash = params
            new_user = {
                "id": self._user_id_seq,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "avatar_url": avatar_url,
                "password_hash": password_hash,
                "created_at": "2025-01-01T00:00:00",
            }
            self._user_id_seq += 1
            self._users.append(new_user)
            return 1

        if q.startswith("update users set email = %s, first_name = %s, last_name = %s, avatar_url = %s, password_hash = %s where id = %s"):
            email, first_name, last_name, avatar_url, password_hash, user_id = params
            updated = 0
            for u in self._users:
                if u["id"] == user_id:
                    u["email"] = email
                    u["first_name"] = first_name
                    u["last_name"] = last_name
                    u["avatar_url"] = avatar_url
                    u["password_hash"] = password_hash
                    updated = 1
                    break
            return updated

        if q.startswith("delete from users where id = %s"):
            user_id = params[0]
            before = len(self._users)
            self._users = [u for u in self._users if u["id"] != user_id]
            return 1 if len(self._users) != before else 0

        # ---------- BOARDS ----------
        if q == "select * from boards":
            return list(self._boards)

        if q.startswith("select * from boards where id = %s"):
            board_id = params[0]
            if "and owner_id = %s" in q:
                owner_id = params[1]
                return [b for b in self._boards if b["id"] == board_id and b["owner_id"] == owner_id]
            return [b for b in self._boards if b["id"] == board_id]

        if q.startswith("select * from boards where owner_id = %s"):
            owner_id = params[0]
            return [b for b in self._boards if b["owner_id"] == owner_id]

        if q.startswith("insert into boards (owner_id, title, description, board_status) values (%s, %s, %s, %s)"):
            owner_id, title, description, board_status = params
            new_id = self._board_id_seq
            new_board = {
                "id": new_id,
                "owner_id": owner_id,
                "title": title,
                "description": description,
                "board_status": board_status,
                "created_at": "2025-01-01T00:00:00",
            }
            self._board_id_seq += 1
            self._boards.append(new_board)
            if "returning id" in q:
                return [{"id": new_id}]
            return 1

        if q.startswith("insert into boards (owner_id, title, description) values (%s, %s, %s)"):
            owner_id, title, description = params
            new_id = self._board_id_seq
            new_board = {
                "id": new_id,
                "owner_id": owner_id,
                "title": title,
                "description": description,
                "board_status": "active",
                "created_at": "2025-01-01T00:00:00",
            }
            self._board_id_seq += 1
            self._boards.append(new_board)
            if "returning id" in q:
                return [{"id": new_id}]
            return 1

        if q.startswith("update boards set title = %s, description = %s where id = %s"):
            title, description, board_id = params
            for b in self._boards:
                if b["id"] == board_id:
                    b["title"] = title
                    b["description"] = description
                    return 1
            return 0

        if q.startswith("update boards set owner_id = %s where id = %s"):
            owner_id, board_id = params
            for b in self._boards:
                if b["id"] == board_id:
                    b["owner_id"] = owner_id
                    return 1
            return 0

        if q.startswith("update boards set board_status = %s where id = %s"):
            board_status, board_id = params
            for b in self._boards:
                if b["id"] == board_id:
                    b["board_status"] = board_status
                    return 1
            return 0

        if q.startswith("delete from boards where id = %s"):
            board_id = params[0]
            before = len(self._boards)
            self._boards = [b for b in self._boards if b["id"] != board_id]
            return 1 if len(self._boards) != before else 0

        # ---------- BOARD MEMBERS ----------
        if q.startswith("select * from board_members where board_id = %s"):
            board_id = params[0]
            if "and user_id = %s" in q:
                user_id = params[1]
                return [m for m in self._board_members if m["board_id"] == board_id and m["user_id"] == user_id]
            return [m for m in self._board_members if m["board_id"] == board_id]

        if q.startswith("insert into board_members (board_id, user_id, role) values (%s, %s, %s)"):
            board_id, user_id, role = params
            new_member = {
                "id": self._board_member_id_seq,
                "board_id": board_id,
                "user_id": user_id,
                "role": role,
            }
            self._board_member_id_seq += 1
            self._board_members.append(new_member)
            return 1

        if q.startswith("delete from board_members where board_id = %s and user_id = %s"):
            board_id, user_id = params
            before = len(self._board_members)
            self._board_members = [
                m for m in self._board_members
                if not (m["board_id"] == board_id and m["user_id"] == user_id)
            ]
            return 1 if len(self._board_members) != before else 0

        if q.startswith("update board_members set role = %s where board_id = %s and user_id = %s"):
            role, board_id, user_id = params
            for m in self._board_members:
                if m["board_id"] == board_id and m["user_id"] == user_id:
                    m["role"] = role
                    return 1
            return 0

        # ---------- LABELS ----------
        if q.startswith("select * from labels where board_id = %s and id = %s"):
            board_id, label_id = params
            return [l for l in self._labels if l["board_id"] == board_id and l["id"] == label_id]

        if q.startswith("select * from labels where board_id = %s"):
            if isinstance(params, (list, tuple)):
                board_id = params[0]
            else:
                board_id = params
            return [l for l in self._labels if l["board_id"] == board_id]

        if q.startswith("insert into labels (board_id, name, color) values (%s, %s, %s)"):
            board_id, name, color = params
            new_id = self._label_id_seq
            new_label = {
                "id": new_id,
                "board_id": board_id,
                "name": name,
                "color": color,
            }
            self._label_id_seq += 1
            self._labels.append(new_label)
            if "returning id" in q:
                return [{"id": new_id}]
            return 1

        if q.startswith("update labels set name = %s, color = %s where id = %s"):
            name, color, label_id = params
            for l in self._labels:
                if l["id"] == label_id:
                    l["name"] = name
                    l["color"] = color
                    return 1
            return 0

        if q.startswith("delete from labels where id = %s"):
            if isinstance(params, (list, tuple)):
                label_id = params[0]
            else:
                label_id = params
            before = len(self._labels)
            self._labels = [l for l in self._labels if l["id"] != label_id]
            return 1 if len(self._labels) != before else 0

        # ---------- LISTS ----------
        if q.startswith("select * from lists where id = %s and board_id = %s"):
            list_id, board_id = params
            res = [l for l in self._lists if l["id"] == list_id and l["board_id"] == board_id]
            return res

        if q.startswith("select * from lists where board_id = %s and id = %s"):
            board_id, list_id = params
            return [l for l in self._lists if l["board_id"] == board_id and l["id"] == list_id]

        if q.startswith("select * from lists where board_id = %s"):
            if isinstance(params, (list, tuple)):
                board_id = params[0]
            else:
                board_id = params
            return [l for l in self._lists if l["board_id"] == board_id]

        if q.startswith("insert into lists (board_id, title, position) values (%s, %s, %s)"):
            board_id, title, position = params
            new_id = self._list_id_seq
            new_list = {
                "id": new_id,
                "board_id": board_id,
                "title": title,
                "position": position,
            }
            self._list_id_seq += 1
            self._lists.append(new_list)
            if "returning id" in q:
                return [{"id": new_id}]
            return 1

        if q.startswith("update lists set title = %s, position = %s where id = %s and board_id = %s"):
            title, position, list_id, board_id = params
            for l in self._lists:
                if l["id"] == list_id and l["board_id"] == board_id:
                    l["title"] = title
                    l["position"] = position
                    return 1
            return 0

        if q.startswith("delete from lists where id = %s and board_id = %s"):
            list_id, board_id = params
            before = len(self._lists)
            self._lists = [l for l in self._lists if not (l["id"] == list_id and l["board_id"] == board_id)]
            return 1 if len(self._lists) != before else 0

        # ---------- CARDS ----------
        if q.startswith("select * from cards where list_id = %s and board_id = %s"):
            list_id, board_id = params
            return [c for c in self._cards if c["list_id"] == list_id and c["board_id"] == board_id]

        if q.startswith("select * from cards where board_id = %s and id = %s"):
            board_id, card_id = params
            res = [c for c in self._cards if c["board_id"] == board_id and c["id"] == card_id]
            return res

        if q.startswith("select * from cards where board_id = %s and list_id = %s"):
            board_id, list_id = params
            return [c for c in self._cards if c["board_id"] == board_id and c["list_id"] == list_id]

        if q.startswith("select * from cards where board_id = %s"):
            if isinstance(params, (list, tuple)):
                board_id = params[0]
            else:
                board_id = params
            return [c for c in self._cards if c["board_id"] == board_id]

        if q.startswith("insert into cards (board_id, list_id, title, description, position) values (%s, %s, %s, %s, %s)"):
            board_id, list_id, title, description, position = params
            new_id = self._card_id_seq
            new_card = {
                "id": new_id,
                "board_id": board_id,
                "list_id": list_id,
                "title": title,
                "description": description,
                "position": position,
            }
            self._card_id_seq += 1
            self._cards.append(new_card)
            if "returning id" in q:
                return [{"id": new_id}]
            return 1

        if q.startswith("update cards set title = %s, description = %s, position = %s where board_id = %s and id = %s"):
            title, description, position, board_id, card_id = params
            for c in self._cards:
                if c["id"] == card_id and c["board_id"] == board_id:
                    c["title"] = title
                    c["description"] = description
                    c["position"] = position
                    return 1
            return 0

        if q.startswith("delete from cards where board_id = %s and id = %s"):
            board_id, card_id = params
            before = len(self._cards)
            self._cards = [c for c in self._cards if not (c["id"] == card_id and c["board_id"] == board_id)]
            return 1 if len(self._cards) != before else 0

        # ---------- CARD LABELS ----------
        if q.startswith("select * from card_labels where board_id = %s and card_id = %s"):
            board_id, card_id = params
            return [cl for cl in self._card_labels if cl["board_id"] == board_id and cl["card_id"] == card_id]

        if q.startswith("insert into card_labels (board_id, card_id, label_id) values (%s, %s, %s)"):
            board_id, card_id, label_id = params
            self._card_labels.append({"board_id": board_id, "card_id": card_id, "label_id": label_id})
            return 1

        if q.startswith("delete from card_labels where board_id = %s and card_id = %s and label_id = %s"):
            board_id, card_id, label_id = params
            before = len(self._card_labels)
            self._card_labels = [cl for cl in self._card_labels if not (cl["board_id"] == board_id and cl["card_id"] == card_id and cl["label_id"] == label_id)]
            return 1 if len(self._card_labels) != before else 0

        # ---------- CARD ASSIGNEES ----------
        if q.startswith("select * from card_assignees where board_id = %s and card_id = %s"):
            board_id, card_id = params
            return [ca for ca in self._card_assignees if ca["board_id"] == board_id and ca["card_id"] == card_id]

        if q.startswith("insert into card_assignees (board_id, card_id, user_id) values (%s, %s, %s)"):
            board_id, card_id, user_id = params
            self._card_assignees.append({"board_id": board_id, "card_id": card_id, "user_id": user_id})
            return 1

        if q.startswith("delete from card_assignees where board_id = %s and card_id = %s and user_id = %s"):
            board_id, card_id, user_id = params
            before = len(self._card_assignees)
            self._card_assignees = [ca for ca in self._card_assignees if not (ca["board_id"] == board_id and ca["card_id"] == card_id and ca["user_id"] == user_id)]
            return 1 if len(self._card_assignees) != before else 0

        if q.startswith("delete from card_assignees where board_id = %s and card_id = %s"):
            board_id, card_id = params
            before = len(self._card_assignees)
            self._card_assignees = [ca for ca in self._card_assignees if not (ca["board_id"] == board_id and ca["card_id"] == card_id)]
            return 1 if len(self._card_assignees) != before else 0

        # ---------- MEMBER BOARDS QUERY (the big JOIN) ----------
        if "from boards b inner join board_members bm on b.id = bm.board_id" in q:
            # params: (user_id, user_id)
            user_id = params[0]
            membership_board_ids = {m["board_id"] for m in self._board_members if m["user_id"] == user_id}
            res = [
                b for b in self._boards
                if b["id"] in membership_board_ids and b["owner_id"] != user_id
            ]
            # simulate ORDER BY created_at DESC (all same in fake, but keep deterministic)
            res.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return res

        raise NotImplementedError(f"FakeDatabaseHandler does not support query: {query!r} params={params!r}")


@pytest.fixture(scope="function")
def fake_db():
    db = FakeDatabaseHandler()
    db.connect()
    return db


@pytest.fixture(scope="function")
def client(fake_db):
    # Ensure backend/src is importable (so `import main` works)
    backend_src = Path(__file__).resolve().parents[1] / "src"
    if str(backend_src) not in sys.path:
        sys.path.insert(0, str(backend_src))

    import main  # backend/src/main.py

    # Patch env values used by APIKeyMiddleware + JWT helpers
    main.env["API_SECRET"] = "test-api-key"
    main.env["JWT_SECRET"] = "test-jwt-secret"
    main.env["JWT_ALGORITHM"] = "HS256"

    # Ensure routes modules see the same JWT/API config (they may have their own `env`)
    from routes import AuthRoutes
    AuthRoutes.env["JWT_SECRET"] = "test-jwt-secret"
    AuthRoutes.env["JWT_ALGORITHM"] = "HS256"

    # Prevent real DB usage (startup event uses this global)
    main.databaseHandler = fake_db

    # Also override dependency injection for routes
    main.app.dependency_overrides[main.get_database_handler] = lambda: fake_db

    with TestClient(main.app) as c:
        # convenience: attach default headers
        c.headers.update({"X-API-KEY": "test-api-key"})
        yield c

    main.app.dependency_overrides.clear()
