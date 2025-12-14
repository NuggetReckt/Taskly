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

        self._user_id_seq = 1
        self._board_id_seq = 1
        self._board_member_id_seq = 1

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

        if q.startswith("insert into users (email, name, avatar_url, password_hash) values (%s, %s, %s, %s)"):
            email, name, avatar_url, password_hash = params
            new_user = {
                "id": self._user_id_seq,
                "email": email,
                "name": name,
                "avatar_url": avatar_url,
                "password_hash": password_hash,
                "created_at": "2025-01-01T00:00:00",
            }
            self._user_id_seq += 1
            self._users.append(new_user)
            return 1

        if q.startswith("update users set email = %s, name = %s, avatar_url = %s, password_hash = %s where id = %s"):
            email, name, avatar_url, password_hash, user_id = params
            updated = 0
            for u in self._users:
                if u["id"] == user_id:
                    u["email"] = email
                    u["name"] = name
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
            return [b for b in self._boards if b["id"] == board_id]

        if q.startswith("select * from boards where owner_id = %s"):
            owner_id = params[0]
            return [b for b in self._boards if b["owner_id"] == owner_id]

        if q.startswith("insert into boards (owner_id, title, description) values (%s, %s, %s)"):
            owner_id, title, description = params
            new_board = {
                "id": self._board_id_seq,
                "owner_id": owner_id,
                "title": title,
                "description": description,
                "created_at": "2025-01-01T00:00:00",
            }
            self._board_id_seq += 1
            self._boards.append(new_board)
            return 1

        if q.startswith("delete from boards where id = %s"):
            board_id = params[0]
            before = len(self._boards)
            self._boards = [b for b in self._boards if b["id"] != board_id]
            return 1 if len(self._boards) != before else 0

        # ---------- BOARD MEMBERS ----------
        if q.startswith("select * from board_members where board_id = %s"):
            board_id = params[0]
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

    # Prevent real DB usage (startup event uses this global)
    main.databaseHandler = fake_db

    # Also override dependency injection for routes
    main.app.dependency_overrides[main.get_database_handler] = lambda: fake_db

    with TestClient(main.app) as c:
        # convenience: attach default headers
        c.headers.update({"X-API-KEY": "test-api-key"})
        yield c

    main.app.dependency_overrides.clear()