from fastapi import APIRouter, Depends, HTTPException

from . import create_user, user_exists_email
from .baseModels.DefaultBaseModels import Status
from .baseModels.UsersBaseModels import UserLoginCredentials, UserRegisterCredentials, UserCreate
from main import get_database_handler
from database import DatabaseHandler
from dotenv import dotenv_values
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt

env = dotenv_values("resources/.env")
router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 60


@router.post("/register", response_model=Status)
def register(creds: UserRegisterCredentials, db: DatabaseHandler = Depends(get_database_handler)):
    user: UserCreate = UserCreate(email=creds.email, name=creds.name, password=creds.password)
    return create_user(user, db)


@router.post("/login")
def login(creds: UserLoginCredentials, db: DatabaseHandler = Depends(get_database_handler)):
    if not user_exists_email(creds.email, db):
        return Status(status="KO", message="Invalid credentials", code=1)

    user = db.execute("SELECT * FROM users WHERE email = %s", creds.email)[0]
    user_bytes = creds.password.encode("utf-8")
    pw = user['password_hash']
    pw_bytes = pw.encode("utf-8")
    result = bcrypt.checkpw(user_bytes, pw_bytes)

    if not result:
        return Status(status="KO", message="Invalid credentials", code=1)
    token = create_access_token({"user_id": user['id'], "email": user['email']})
    return {"access_token": token, "token_type": "bearer"}


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, env["JWT_SECRET"], algorithm=env["JWT_ALGORITHM"])
    return encoded_jwt


def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, env["JWT_SECRET"], algorithms=env["JWT_ALGORITHM"])
        return payload
    except JWTError:
        return None
