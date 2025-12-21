from fastapi import APIRouter, Depends, HTTPException

from .baseModels.UsersBaseModels import User, UserList, UserCreate
from .baseModels.BoardsBaseModels import Board, BoardList
from .baseModels.DefaultBaseModels import statusOk
from main import get_database_handler
from database import DatabaseHandler
import bcrypt

router = APIRouter()


@router.get("/users", response_model=UserList)
def get_users(db: DatabaseHandler = Depends(get_database_handler)):
    users: list[User] = []
    result = db.execute("SELECT * FROM users")

    for user in result:
        users.append(
            User(id=user['id'], email=user['email'], first_name=user['first_name'], last_name=user['last_name'],
                 avatar_url=user['avatar_url'], created_at=str(user['created_at']))
        )
    return UserList(users_count=len(users), users=users)


@router.get("/user/{user_id}", response_model=User)
def get_user(user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    user = db.execute("SELECT * FROM users WHERE id = %s", user_id)[0]
    return User(id=user_id, email=user['email'], first_name=user['first_name'], last_name=user['last_name'], avatar_url=user['avatar_url'],
                created_at=str(user['created_at']))


@router.get("/user/{user_id}/boards", response_model=BoardList)
def get_user_boards(user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    boards: list[Board] = []
    result = db.execute("SELECT * FROM boards WHERE owner_id = %s", user_id)

    for board in result:
        boards.append(
            Board(id=board['id'], owner_id=board['owner_id'], title=board['title'], description=board['description']))
    return BoardList(boards_count=len(boards), boards=boards)


@router.put("/user/{user_id}")
def update_user(user_id: int, user: User, db: DatabaseHandler = Depends(get_database_handler)):
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    db.execute("UPDATE users SET email = %s, first_name = %s, last_name = %s, avatar_url = %s, password_hash = %s WHERE id = %s",
               (user.email, user.first_name, user.last_name, user.avatar_url, user.password_hash, user_id))
    return statusOk


@router.post("/user")
def create_user(user: UserCreate, db: DatabaseHandler = Depends(get_database_handler)):
    result = db.execute("SELECT * FROM users WHERE email = %s", user.email)
    if result is not None and len(result) > 0:
        raise HTTPException(status_code=409, detail="User already exists")

    pw_bytes = user.password.encode("utf-8")
    salt = bcrypt.gensalt()
    pw_hash = bcrypt.hashpw(pw_bytes, salt)

    db.execute("INSERT INTO users (email, first_name, last_name, avatar_url, password_hash) VALUES (%s, %s, %s, %s, %s)",
               (user.email, user.first_name, user.last_name, user.avatar_url, pw_hash.decode('utf-8')))
    return statusOk


@router.delete("/user/{user_id}")
def delete_user(user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    db.execute("DELETE FROM users WHERE id = %s", user_id)
    return statusOk


def user_exists(user_id: int, db: DatabaseHandler) -> bool:
    user = db.execute("SELECT * FROM users WHERE id = %s", user_id)

    if user is None or len(user) == 0:
        return False
    return True


def user_exists_email(email: str, db: DatabaseHandler) -> bool:
    user = db.execute("SELECT * FROM users WHERE email = %s", email)

    if user is None or len(user) == 0:
        return False
    return True
