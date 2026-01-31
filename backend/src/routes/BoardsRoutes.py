from database import DatabaseHandler
from fastapi import APIRouter, Depends, HTTPException
from main import get_database_handler

from . import user_exists
from .baseModels import Label
from .baseModels.BoardsBaseModels import Board, BoardList, BoardDetails, BoardMember, BoardMemberList, List, Card
from .baseModels.DefaultBaseModels import statusOk

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
        listId: int = int(boardList['id'])
        cards: list[Card] = get_board_cards_for_list(board_id, listId, db)
        boardLists.append(
            List(id=boardList['id'], board_id=board_id, title=boardList['title'], position=boardList['position'], cards=cards))

    return BoardDetails(id=board_id, owner_id=board['owner_id'], title=board['title'],
                        description=board['description'], labels=boardLabels, lists=boardLists, members=members)


@router.put("/board/{board_id}")
def update_board(board_id: int, board: Board, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    db.execute("UPDATE boards SET title = %s, description = %s WHERE id = %s", (board.title, board.description, board_id))
    return statusOk


# Board members
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
    if not user_exists(member.user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    if is_board_owner(board_id, member.user_id, db):
        raise HTTPException(status_code=400, detail="User is the board owner")

    if is_board_member(board_id, member.user_id, db):
        raise HTTPException(status_code=400, detail="User is already a member of this board")

    if member.role not in ["member", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    db.execute("INSERT INTO board_members (board_id, user_id, role) VALUES (%s, %s, %s)",
               (board_id, member.user_id, member.role))
    return statusOk


@router.delete("/board/{board_id}/member")
def remove_board_member(board_id: int, user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    if not is_board_member(board_id, user_id, db):
        raise HTTPException(status_code=404, detail="User is not a member of this board")

    db.execute("DELETE FROM board_members WHERE board_id = %s AND user_id = %s", (board_id, user_id))
    return statusOk


# Board Labels
@router.get("/board/{board_id}/labels")
def get_board_labels(board_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTlocalhostTPException(status_code=404, detail="Board not found")

    labels: list[Label] = []
    result = db.execute("SELECT * FROM labels WHERE board_id = %s", board_id)

    for label in result:
        labels.append(Label(board_id=label['board_id'], name=label['name'], color=label['color']))
    return labels


@router.post("/board/{board_id}/label")
def add_board_label(board_id: int, label: Label, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    result = db.execute("INSERT INTO labels (board_id, name, color) VALUES (%s, %s, %s) RETURNING id",
                        (board_id, label.name, label.color))
    return {"id": result[0]['id']}


@router.get("/board/{board_id}/label/{label_id}")
def get_board_label(board_id: int, label_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    result = db.execute("SELECT * FROM labels WHERE board_id = %s AND id = %s", (board_id, label_id))
    if result is None or len(result) == 0:
        raise HTTPException(status_code=404, detail="Label not found")
    return Label(board_id=result[0]['board_id'], name=result[0]['name'], color=result[0]['color'])


@router.put("/board/{board_id}/label/{label_id}")
def edit_board_label(board_id: int, label_id: int, label: Label, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not label_exists(board_id, label_id, db):
        raise HTTPException(status_code=404, detail="Label not found")

    db.execute("UPDATE labels SET name = %s, color = %s WHERE id = %s", (label.name, label.color, label_id))
    return statusOk


@router.delete("/board/{board_id}/label/{label_id}")
def remove_board_label(board_id: int, label_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not label_exists(board_id, label_id, db):
        raise HTTPException(status_code=404, detail="Label not found")

    db.execute("DELETE FROM labels WHERE id = %s", label_id)
    return statusOk


# Board Lists
@router.get("/board/{board_id}/lists")
def get_board_lists(board_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    lists: list[List] = []
    result = db.execute("SELECT * FROM lists WHERE board_id = %s", board_id)

    for l in result:
        cards: list[Card] = get_board_cards_for_list(board_id, l['id'], db)
        lists.append(List(id=l['id'], board_id=l['board_id'], title=l['title'], position=l['position'], cards=cards))
    return lists


@router.post("/board/{board_id}/list")
def add_board_list(board_id: int, board_list: List, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    result = db.execute("INSERT INTO lists (board_id, title, position) VALUES (%s, %s, %s) RETURNING id",
                        (board_id, board_list.title, board_list.position))
    return {"id": result[0]['id']}


@router.get("/board/{board_id}/list/{list_id}")
def get_board_list(board_id: int, list_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not list_exists(board_id, list_id, db):
        raise HTTPException(status_code=404, detail="List not found")

    cards: list[Card] = get_board_cards_for_list(board_id, list_id, db)
    res = db.execute("SELECT * FROM lists WHERE id = %s AND board_id = %s", (list_id, board_id))

    return List(board_id=res[0]['board_id'], title=res[0]['title'], position=res[0]['position'], cards=cards)


@router.put("/board/{board_id}/list/{list_id}")
def update_board_list(board_id: int, list_id: int, data: List, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not list_exists(board_id, list_id, db):
        raise HTTPException(status_code=404, detail="List not found")

    if not data.title or not data.position:
        raise HTTPException(status_code=400, detail="title and position are required")

    db.execute("UPDATE lists SET title = %s, position = %s WHERE id = %s AND board_id = %s", (data.title, data.position, list_id, board_id))
    return statusOk


@router.delete("/board/{board_id}/list/{list_id}")
def remove_board_list(board_id: int, list_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not list_exists(board_id, list_id, db):
        raise HTTPException(status_code=404, detail="List not found")

    db.execute("DELETE FROM lists WHERE id = %s AND board_id = %s", (list_id, board_id))
    return statusOk


# Board Cards
@router.get("/board/{board_id}/cards")
def get_board_cards(board_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")

    cards: list[Card] = []
    result = db.execute("SELECT * FROM cards WHERE board_id = %s", board_id)

    for card in result:
        card_id = int(card['id'])
        cardLabels: list[int] = []
        cardAssignees: list[int] = []

        labels = db.execute("SELECT * FROM card_labels WHERE board_id = %s AND card_id = %s", (board_id, card_id))
        for label in labels:
            cardLabels.append(label['label_id'])

        assignees = db.execute("SELECT * FROM card_assignees WHERE board_id = %s AND card_id = %s", (board_id, card_id))
        for assignee in assignees:
            cardAssignees.append(assignee['user_id'])

        cards.append(Card(id=card_id, list_id=card['list_id'], board_id=card['board_id'], title=card['title'],
                          description=card['description'], position=card['position'], assignees=cardAssignees, labels=cardLabels))
    return cards


@router.post("/board/{board_id}/card")
def add_board_card(board_id: int, card: Card, db: DatabaseHandler = Depends(get_database_handler)):
    if card.list_id is None:
        raise HTTPException(status_code=400, detail="List id is required")

    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not list_exists(board_id, card.list_id, db):
        raise HTTPException(status_code=404, detail="List not found")

    result = db.execute("INSERT INTO cards (board_id, list_id, title, description, position) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                        (board_id, card.list_id, card.title, card.description, card.position))
    return {"id": result[0]['id']}


@router.put("/board/{board_id}/card/{card_id}")
def edit_board_card(board_id: int, card_id: int, card: Card, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")

    db.execute("UPDATE cards SET title = %s, description = %s, position = %s WHERE board_id = %s AND id = %s",
               (card.title, card.description, card.position, board_id, card_id))
    return statusOk


@router.delete("/board/{board_id}/card/{card_id}")
def remove_board_card(board_id: int, card_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")

    db.execute("DELETE FROM cards WHERE board_id = %s AND id = %s", (board_id, card_id))
    return statusOk


@router.get("/board/{board_id}/card/{card_id}")
def get_board_card(board_id: int, card_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")

    result = db.execute("SELECT * FROM cards WHERE board_id = %s AND id = %s", (board_id, card_id))
    cardLabels: list[int] = []
    cardAssignees: list[int] = []

    labels = db.execute("SELECT * FROM card_labels WHERE board_id = %s AND card_id = %s", (board_id, result[0]['id']))
    for label in labels:
        cardLabels.append(label['label_id'])

    assignees = db.execute("SELECT * FROM card_assignees WHERE board_id = %s AND card_id = %s", (board_id, result[0]['id']))
    for assignee in assignees:
        cardAssignees.append(assignee['user_id'])
    return Card(list_id=result[0]['list_id'], board_id=result[0]['board_id'], title=result[0]['title'], description=result[0]['description'],
                position=result[0]['position'], assignees=cardAssignees, labels=cardLabels)


@router.get("/board/{board_id}/card/{card_id}/assignees")
def get_board_card_assignees(board_id: int, card_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")

    cardAssignees: list[int] = []
    assignees = db.execute("SELECT * FROM card_assignees WHERE board_id = %s AND card_id = %s", (board_id, card_id))
    for assignee in assignees:
        cardAssignees.append(assignee['user_id'])
    return cardAssignees


@router.post("/board/{board_id}/card/{card_id}/assignee")
def add_board_card_assignee(board_id: int, card_id: int, user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")
    if not user_id or not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    db.execute("INSERT INTO card_assignees (board_id, card_id, user_id) VALUES (%s, %s, %s)",
               (board_id, card_id, user_id))
    return statusOk


@router.delete("/board/{board_id}/card/{card_id}/assignee/{user_id}")
def remove_board_card_assignee(board_id: int, card_id: int, user_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")
    if not user_exists(user_id, db):
        raise HTTPException(status_code=404, detail="User not found")

    db.execute("DELETE FROM card_assignees WHERE board_id = %s AND card_id = %s AND user_id = %s", (board_id, card_id, user_id))
    return statusOk


@router.get("/board/{board_id}/card/{card_id}/labels")
def get_board_card_labels(board_id: int, card_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")

    cardLabels: list[int] = []
    labels = db.execute("SELECT * FROM card_labels WHERE board_id = %s AND card_id = %s", (board_id, card_id))
    for label in labels:
        cardLabels.append(label['label_id'])
    return cardLabels


@router.post("/board/{board_id}/card/{card_id}/label")
def add_board_card_label(board_id: int, card_id: int, label_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")
    if not label_id or not label_exists(board_id, label_id, db):
        raise HTTPException(status_code=404, detail="Label not found")

    db.execute("INSERT INTO card_labels (board_id, card_id, label_id) VALUES (%s, %s, %s)", (board_id, card_id, label_id))
    return statusOk


@router.delete("/board/{board_id}/card/{card_id}/label/{label_id}")
def add_board_card_label(board_id: int, card_id: int, label_id: int, db: DatabaseHandler = Depends(get_database_handler)):
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not card_exists(board_id, card_id, db):
        raise HTTPException(status_code=404, detail="Card not found")
    if not label_exists(board_id, label_id, db):
        raise HTTPException(status_code=404, detail="Label not found")

    db.execute("DELETE FROM card_labels WHERE board_id = %s AND card_id = %s AND label_id = %s)", (board_id, card_id, label_id))
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


def get_board_cards_for_list(board_id: int, list_id: int, db: DatabaseHandler) -> list[Card]:
    if not board_exists(board_id, db):
        raise HTTPException(status_code=404, detail="Board not found")
    if not list_exists(board_id, list_id, db):
        raise HTTPException(status_code=404, detail="List not found")

    cardsList: list[Card] = []
    cards = db.execute("SELECT * FROM cards WHERE list_id = %s AND board_id = %s", (list_id, board_id))

    for card in cards:
        card_id: int = int(card['id'])
        labels = db.execute("SELECT label_id FROM card_labels WHERE card_id = %s AND board_id = %s", (card_id, board_id))
        assignees = db.execute("SELECT user_id FROM card_assignees WHERE card_id = %s AND board_id = %s", (card_id, board_id))

        cardLabels: list[int] = []
        cardAssignees: list[int] = []

        for label in labels:
            cardLabels.append(label['label_id'])
        for assignee in assignees:
            cardAssignees.append(assignee['user_id'])

        cardsList.append(Card(id=card_id, list_id=card['list_id'], board_id=board_id, title=card['title'], position=card['position'],
                              description=card['description'], labels=cardLabels, assignees=cardAssignees))
    return cardsList


def board_exists(board_id: int, db: DatabaseHandler) -> bool:
    board = db.execute("SELECT * FROM boards WHERE id = %s", board_id)

    if board is None or len(board) == 0:
        return False
    return True


def is_board_owner(board_id: int, user_id: int, db: DatabaseHandler) -> bool:
    board = db.execute("SELECT * FROM boards WHERE id = %s AND owner_id = %s", (board_id, user_id))

    if board is None or len(board) == 0:
        return False
    return True


def is_board_member(board_id: int, user_id: int, db: DatabaseHandler) -> bool:
    member = db.execute("SELECT * FROM board_members WHERE board_id = %s AND user_id = %s", (board_id, user_id))

    if member is None or len(member) == 0:
        return False
    return True


def label_exists(board_id: int, label_id: int, db: DatabaseHandler) -> bool:
    result = db.execute("SELECT * FROM labels WHERE board_id = %s AND id = %s", (board_id, label_id))
    if result is None or len(result) == 0:
        return False
    return True


def card_exists(board_id: int, card_id: int, db: DatabaseHandler) -> bool:
    result = db.execute("SELECT * FROM cards WHERE board_id = %s AND id = %s", (board_id, card_id))
    if result is None or len(result) == 0:
        return False
    return True


def list_exists(board_id: int, list_id: int, db: DatabaseHandler) -> bool:
    result = db.execute("SELECT * FROM lists WHERE board_id = %s AND id = %s", (board_id, list_id))
    if result is None or len(result) == 0:
        return False
    return True
