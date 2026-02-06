import List, {ListData} from "@/app/components/list";
import {User, useUser} from "@/app/components/user";
import Label, {LabelData} from "@/app/components/label";
import React, {useState} from "react";
import {createLabel} from "@/app/http/boards";
import {addCardAssignee, addCardLabel, createCard, removeCardAssignee, removeCardLabel, updateCard} from "@/app/http/cards";
import {createList, moveList} from "@/app/http/lists";
import {CardData} from "@/app/components/card";
import MemberMedal from "@/app/components/memberMedal";
import {DndContext} from "@dnd-kit/core";

export interface BoardMemberData {
    user: User;
    role: string;
}

export interface BoardViewData {
    id: number;
    title: string;
    description: string;
    owner: User;
    members: BoardMemberData[];
    lists: ListData[];
    labels: LabelData[];
}

export default function BoardView(data: BoardViewData) {
    const user = useUser();
    const [currentListPos, setCurrentListPos] = useState(data.lists.length);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#000000");
    const [newCardTitle, setNewCardTitle] = useState("");
    const [newCardDesc, setNewCardDesc] = useState("");
    const [newCardListId, setNewCardListId] = useState<number | null>(null);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [editingCardTitle, setEditingCardTitle] = useState("");
    const [editingCardDesc, setEditingCardDesc] = useState("");
    const [isLabelSelectorOpen, setIsLabelSelectorOpen] = useState(false);
    const [isAssigneeSelectorOpen, setIsAssigneeSelectorOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [creating, setCreating] = useState(false);
    const [parent, setParent] = useState(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateListClick = () => {
        setIsModalOpen(true);
    };
    const handlePlusClick = () => {
        if (isPlusModalOpen) {
            setIsPlusModalOpen(false);
        } else {
            setIsPlusModalOpen(true);
        }
    }
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsPlusModalOpen(false);
        setIsLabelModalOpen(false);
        setIsCardModalOpen(false);
        setSelectedCard(null);
        setIsLabelSelectorOpen(false);
        setIsAssigneeSelectorOpen(false);
        setError(null);
    };

    const handleCardClick = (card: CardData) => {
        setSelectedCard(card);
        setEditingCardTitle(card.title);
        setEditingCardDesc(card.desc);
    };

    const onSaveCard = async () => {
        if (!selectedCard) return;
        setCreating(true);
        try {
            await updateCard(data.id, selectedCard.id, editingCardTitle, editingCardDesc, selectedCard.pos);
            handleCloseModal();
            window.location.reload();
        } catch (err: any) {
            setError(err?.message ?? "Failed to update card");
        } finally {
            setCreating(false);
        }
    };

    const onAddLabelToCard = async (label: LabelData) => {
        if (!selectedCard || !label.id) return;
        try {
            await addCardLabel(data.id, selectedCard.id, label.id);
            const updatedCard = {...selectedCard, labels: [...selectedCard.labels, label]};
            setSelectedCard(updatedCard);
            setIsLabelSelectorOpen(false);
        } catch (err: any) {
            setError(err?.message ?? "Failed to add label");
        }
    };

    const onRemoveLabelFromCard = async (labelId: number) => {
        if (!selectedCard) return;
        try {
            await removeCardLabel(data.id, selectedCard.id, labelId);
            const updatedCard = {...selectedCard, labels: selectedCard.labels.filter(l => l.id !== labelId)};
            setSelectedCard(updatedCard);
        } catch (err: any) {
            setError(err?.message ?? "Failed to remove label");
        }
    };

    const onAddAssigneeToCard = async (member: BoardMemberData) => {
        if (!selectedCard) return;
        try {
            await addCardAssignee(data.id, selectedCard.id, member.user.id);
            const updatedCard = {...selectedCard, assignees: [...selectedCard.assignees, member]};
            setSelectedCard(updatedCard);
            setIsAssigneeSelectorOpen(false);
        } catch (err: any) {
            setError(err?.message ?? "Failed to add assignee");
        }
    };

    const onRemoveAssigneeFromCard = async (userId: number) => {
        if (!selectedCard) return;
        try {
            await removeCardAssignee(data.id, selectedCard.id, userId);
            const updatedCard = {...selectedCard, assignees: selectedCard.assignees.filter(a => a.user.id !== userId)};
            setSelectedCard(updatedCard);
        } catch (err: any) {
            setError(err?.message ?? "Failed to remove assignee");
        }
    };

    const onCreateLabel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newLabelName.trim()) return;

        setCreating(true);
        setError(null);

        try {
            await createLabel(data.id, newLabelName.trim(), newLabelColor);
            handleCloseModal();
            window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
        } catch (err: any) {
            setError(err?.message ?? "Failed to create label");
        } finally {
            setCreating(false);
        }
    };

    const onCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newCardTitle.trim() || newCardListId === null) return;

        setCreating(true);
        setError(null);

        try {
            const list = data.lists.find(l => l.id === newCardListId);
            const pos = list ? list.cards.length : 0;
            await createCard(data.id, newCardListId, newCardTitle.trim(), newCardDesc.trim(), pos);
            handleCloseModal();
            window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
        } catch (err: any) {
            setError(err?.message ?? "Failed to create card");
        } finally {
            setCreating(false);
        }
    };

    const onCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newListTitle.trim()) return;

        setCreating(true);
        setError(null);

        try {
            setCurrentListPos(data.lists.length)
            const result = await createList(data.id, newListTitle.trim(), currentListPos + 1);
            handleCloseModal();
            if (result && result.id) {
                setCurrentListPos(currentListPos + 1);
                window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create list");
        } finally {
            setCreating(false);
        }
    };

    function handleListDragEnd(event: any) {
        const {over} = event;

        // If the item is dropped over a container, set it as the parent
        // otherwise reset the parent to `null`
        setParent(over ? over.id : null);

        if (over == null) return;

        if (over.id != null) {
            moveList(data.id, over.id, 4).then(r => {
                // window.location.reload(); /* TODO: TROUVER MEILLEUR MOYEN DE REFRESH LE BOARD */
            });
        }
    }

    const listItems = data.lists.sort((a, b) => a.pos - b.pos).map(list =>
        <li key={"list_" + list.pos} className="list-wrapper">
            <List id={list.id} boardId={list.boardId} pos={list.pos} title={list.title} cards={list.cards}
                  onCardClick={handleCardClick}/>
        </li>
    );

    let createListLabel = "Create a new list";
    if (listItems.length === 0)
        createListLabel = "Create your first list";
    listItems.push(
        <li key={"list_create"} className="list-wrapper create-first-list">
            <button className="card-add-btn" onClick={handleCreateListClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>{createListLabel}</span>
            </button>
        </li>
    )

    return (
        <div className="board-content">
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create List</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateList}>
                                <label className="auth-field">
                                    <span className="auth-label">List Title</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newListTitle}
                                        onChange={(e) => setNewListTitle(e.target.value)}
                                        placeholder="My new list"
                                        required
                                        autoFocus
                                    />
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newListTitle.trim()}>
                                    {creating ? "Creating..." : "Create List"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {isLabelModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create Label</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateLabel}>
                                <label className="auth-field">
                                    <span className="auth-label">Label Name</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        placeholder="Label name"
                                        required
                                        autoFocus
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">Label Color</span>
                                    <input
                                        className="auth-input"
                                        type="color"
                                        value={newLabelColor}
                                        onChange={(e) => setNewLabelColor(e.target.value)}
                                        required
                                    />
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newLabelName.trim()}>
                                    {creating ? "Creating..." : "Create Label"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {isCardModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create Card</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateCard}>
                                <label className="auth-field">
                                    <span className="auth-label">Card Title</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newCardTitle}
                                        onChange={(e) => setNewCardTitle(e.target.value)}
                                        placeholder="Card title"
                                        required
                                        autoFocus
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">Description</span>
                                    <textarea
                                        className="auth-input"
                                        value={newCardDesc}
                                        onChange={(e) => setNewCardDesc(e.target.value)}
                                        placeholder="Card description"
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">List</span>
                                    <select
                                        className="auth-input"
                                        value={newCardListId ?? ""}
                                        onChange={(e) => setNewCardListId(Number(e.target.value))}
                                        required
                                    >
                                        <option value="" disabled>Select a list</option>
                                        {data.lists.map(list => (
                                            <option key={list.id} value={list.id}>{list.title}</option>
                                        ))}
                                    </select>
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newCardTitle.trim() || newCardListId === null}>
                                    {creating ? "Creating..." : "Create Card"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <div className="board-header">
                <h1>{data.title}</h1>
                <div className="header-tools">
                    <div className="tool-searchbar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input type="text" data-slot="input" placeholder="Search cards..."/>
                    </div>
                    <button data-slot="button" className="tool-button" onClick={handlePlusClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-5">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </button>
                    {isPlusModalOpen && (
                        <div className="plus-modal">
                            <button onClick={() => {
                                setIsLabelModalOpen(true);
                                setIsPlusModalOpen(false);
                            }}>Create label
                            </button>
                            <button onClick={() => {
                                setIsModalOpen(true);
                                setIsPlusModalOpen(false);
                            }}>Create list
                            </button>
                            <button onClick={() => {
                                setIsCardModalOpen(true);
                                setIsPlusModalOpen(false);
                                if (data.lists.length > 0) setNewCardListId(data.lists[0].id);
                            }}>Create card
                            </button>
                        </div>
                    )}
                    <a href="/app" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-house size-5">
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                            <path
                                d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                    </a>
                    <button data-slot="button" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 16 16"
                             className="lucide lucide-house size-5">
                            <path fill="currentcolor" fillRule="evenodd"
                                  d="M5 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M1 4a4 4 0 1 1 8 0 4 4 0 0 1-8 0m11.25 4.75V11h1.5V8.75H16v-1.5h-2.25V5h-1.5v2.25H10v1.5zm-8.5 1.75a2.25 2.25 0 0 0-2.25 2.25V15H0v-2.25A3.75 3.75 0 0 1 3.75 9h2.5A3.75 3.75 0 0 1 10 12.75V15H8.5v-2.25a2.25 2.25 0 0 0-2.25-2.25z"
                                  clipRule="evenodd"></path>
                        </svg>
                    </button>
                    <button data-slot="button" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-settings size-5">
                            <path
                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>
            <DndContext onDragEnd={handleListDragEnd}>
                <div className="lists-wrapper">
                    <ul className="lists">{listItems}</ul>
                </div>
            </DndContext>
            {selectedCard && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content card-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <input
                                className="modal-title-input"
                                value={editingCardTitle}
                                onChange={(e) => setEditingCardTitle(e.target.value)}
                            />
                            <button className="modal-close" onClick={handleCloseModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="lucide lucide-x size-5">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-section">
                                <h3 className="section-title">Description</h3>
                                <textarea
                                    className="description-textarea"
                                    value={editingCardDesc}
                                    onChange={(e) => setEditingCardDesc(e.target.value)}
                                    placeholder="Add a description..."
                                />
                            </div>

                            <div className="modal-section">
                                <h3 className="section-title">Labels</h3>
                                <div className="labels-list">
                                    {selectedCard.labels.map(label => (
                                        <div key={label.id} className="label-item-wrapper">
                                            <Label name={label.name} color={label.color}/>
                                            <button className="remove-btn" onClick={() => label.id && onRemoveLabelFromCard(label.id)}>-
                                            </button>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <button className="add-btn" onClick={() => setIsLabelSelectorOpen(!isLabelSelectorOpen)}>+</button>
                                        {isLabelSelectorOpen && (
                                            <div className="selector-dropdown">
                                                {data.labels.filter(l => !selectedCard.labels.find(sl => sl.id === l.id)).map(label => (
                                                    <div key={label.id} className="selector-item" onClick={() => onAddLabelToCard(label)}>
                                                        <Label name={label.name} color={label.color}/>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3 className="section-title">Assignees</h3>
                                <div className="assignees-list">
                                    {selectedCard.assignees.map(assignee => (
                                        <div key={assignee.user.id} className="assignee-item-wrapper">
                                            <MemberMedal member={assignee.user}/>
                                            <button className="remove-btn" onClick={() => onRemoveAssigneeFromCard(assignee.user.id)}>-
                                            </button>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <button className="add-btn" onClick={() => setIsAssigneeSelectorOpen(!isAssigneeSelectorOpen)}>+
                                        </button>
                                        {isAssigneeSelectorOpen && (
                                            <div className="selector-dropdown">
                                                {data.members.filter(m => !selectedCard.assignees.find(sa => sa.user.id === m.user.id)).map(member => (
                                                    <div key={member.user.id} className="selector-item"
                                                         onClick={() => onAddAssigneeToCard(member)}>
                                                        <MemberMedal member={member.user}/>
                                                        <span>{member.user.firstName} {member.user.lastName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3 className="section-title">Comments</h3>
                                <div className="comment-input-wrapper">
                                    <textarea
                                        className="comment-textarea"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                    />
                                    <button className="auth-button" onClick={() => {/* Add comment logic if needed */
                                    }}>Add Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {error && <p className="auth-error">{error}</p>}
                            <button className="auth-button" onClick={onSaveCard} disabled={creating}>
                                {creating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
