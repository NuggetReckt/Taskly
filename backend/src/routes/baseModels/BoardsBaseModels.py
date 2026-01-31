from typing import Optional

from pydantic import BaseModel


class BoardMember(BaseModel):
    id: Optional[int] = None
    board_id: Optional[int] = None
    user_id: int
    role: str
    joined_at: Optional[str] = None


class BoardMemberList(BaseModel):
    members_count: int
    members: list[BoardMember]


class Label(BaseModel):
    id: Optional[int] = None
    board_id: Optional[int] = None
    name: str
    color: str


class Comment(BaseModel):
    id: Optional[int] = None
    card_id: Optional[int] = None
    board_id: Optional[int] = None
    author_id: int
    content: str
    created_at: Optional[str] = None


class Card(BaseModel):
    id: Optional[int] = None
    list_id: Optional[int] = None
    board_id: Optional[int] = None
    title: str
    position: int
    description: str
    labels: Optional[list[int]] = None
    assignees: Optional[list[int]] = None


class List(BaseModel):
    id: Optional[int] = None
    board_id: Optional[int] = None
    title: str
    position: int
    cards: Optional[list[Card]] = None
    created_at: Optional[str] = None


class CardDetail(BaseModel):
    card: Card
    comments: Optional[list[Comment]] = None
    due_date: Optional[str] = None
    created_at: str
    updated_at: str


class Board(BaseModel):
    id: Optional[int] = None
    owner_id: int
    title: str
    description: str


class BoardList(BaseModel):
    boards_count: int
    boards: list[Board]


class BoardDetails(BaseModel):
    id: Optional[int] = None
    owner_id: int
    title: str
    description: str
    labels: Optional[list[Label]] = None
    lists: Optional[list[List]] = None
    members: Optional[list[BoardMember]] = None
