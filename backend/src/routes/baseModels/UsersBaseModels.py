from typing import Optional

from pydantic import BaseModel


class User(BaseModel):
    id: Optional[int] = None
    email: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    password_hash: Optional[str] = None
    created_at: Optional[str] = None


class UserLoginCredentials(BaseModel):
    email: str
    password: str


class UserRegisterCredentials(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str


class UserCreate(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str
    avatar_url: Optional[str] = None


class UserList(BaseModel):
    users_count: int
    users: list[User]
