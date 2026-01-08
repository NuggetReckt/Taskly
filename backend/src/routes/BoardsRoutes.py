from fastapi import APIRouter, Depends, HTTPException

from . import user_exists
from .baseModels import Label
from .baseModels.DefaultBaseModels import Status, statusOk
from .baseModels.BoardsBaseModels import Board, BoardList, BoardDetails, BoardMember, BoardMemberList, List, Card
from main import get_database_handler
from database import DatabaseHandler

router = APIRouter()


@router.get("/boards", response_model=BoardList)
def get_boards(db: DatabaseHandler = Depends(get_database_handler)):
    boards: list[Board] = []
    result = db.execute("SELECT * FROM boards")

    for board in result:
        boards.append(
            Board(id=board['id'], owner_id=board['owner_id'], title=board['title'], description=board['description'])
        )
    return BoardList(boards_count=len(boards), boards=boards)


@router.get("/board/{board_id}", response_model=BoardDetails)
def get_board(board_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    board = db.execute("SELECT * FROM boards WHERE id = %s", board_id)[0]
    labels = db.execute("SELECT * FROM labels WHERE board_id = %s", board_id)
    lists = db.execute("SELECT * FROM lists WHERE board_id = %s", board_id)

    boardLabels: list[Label] = []
    boardLists: list[List] = []
    members: list[BoardMember] = get_board_members(board_id, db).members

    for label in labels:
        boardLabels.append(
            Label(board_id=board_id, name=label['name'], color=label['color'])
        )
    for boardList in lists:
        cards = db.execute("SELECT * FROM cards WHERE list_id = %s", board_id)
        listCards: list[Card] = []

        for card in cards:
            # TODO: Add card desc, labels, assignees, ...
            continue

        boardLists.append(List(board_id=board_id, title=boardList['title'], position=boardList['position'], cards=listCards))

    return BoardDetails(id=board_id, owner_id=board['owner_id'], title=board['title'],
                        description=board['description'], labels=boardLabels, lists=boardLists, members=members)


@router.put("/board/{board_id}")
def update_board(board_id: int, board: Board, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    # TODO: update board data
    return statusOk


@router.get("/board/{board_id}/members")
def get_board_members(board_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    members: list[BoardMember] = []
    result = db.execute("SELECT * FROM board_members WHERE board_id = %s", board_id)

    for member in result:
        members.append(
            BoardMember(id=member['id'], board_id=member['board_id'], user_id=member['user_id'], role=member['role'])
        )
    return BoardMemberList(members_count=len(members), members=members)


@router.get("/boards/{user_id}")
def get_member_boards(user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    boards: list[Board] = []
    result = db.execute("""
                        SELECT DISTINCT b.id, b.owner_id, b.title, b.description, b.created_at
                        FROM boards b
                                 INNER JOIN board_members bm ON b.id = bm.board_id
                        WHERE bm.user_id = %s
                          AND b.owner_id != %s
                        ORDER BY b.created_at DESC
                        """, (user_id, user_id))

    for board in result:
        boards.append(
            Board(id=board['id'], owner_id=board['owner_id'], title=board['title'], description=board['description'])
        )
    return BoardList(boards_count=len(boards), boards=boards)


@router.put("/board/{board_id}/member")
def add_board_member(board_id: int, member: BoardMember, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    # TODO: check if board member already exists
    # TODO: check if member is not the board owner
    # TODO: check If member exists as a user
    # TODO: check If member role is correct
    db.execute("INSERT INTO board_members (board_id, user_id, role) VALUES (%s, %s, %s)",
               (board_id, member.user_id, member.role))
    return statusOk


@router.delete("/board/{board_id}/member")
def remove_board_member(board_id: int, user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    # TODO: check if board member exists
    db.execute("DELETE FROM board_members WHERE board_id = %s AND user_id = %s", (board_id, user_id))
    return statusOk


@router.post("/board")
def create_board(board: Board, db: DatabaseHandler = Depends(get_database_handler)):
    result = db.execute("INSERT INTO boards (owner_id, title, description) VALUES (%s, %s, %s) RETURNING id",
                        (board.owner_id, board.title, board.description))
    return {"id": result[0]['id']}


@router.delete("/board/{board_id}")
def delete_board(board_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    db.execute("DELETE FROM boards WHERE id = %s", board_id)
    return statusOk


def board_exists(board_id: int, db: DatabaseHandler) -> bool:
    board = db.execute("SELECT * FROM boards WHERE id = %s", board_id)

    if board is None or len(board) == 0:
        return False
    return True
