import Card from "@/app/components/card";
import {CardData} from "@/app/components/card";
import React, {useState} from "react";
import {createList, updateList} from "@/app/http/lists";
import {useUser} from "@/app/components/user";
import {createCard} from "@/app/http/cards";

export interface ListData {
    id: number;
    boardId: number;
    pos: number;
    title: string;
    cards: CardData[];
    //...
}

export default function List(data: ListData) {
    const user = useUser();
    const [currentCardPos, setCurrentCardPos] = useState(data.cards.length);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState(user?.firstName + "'s card");
    const [newCardDesc, setNewCardDesc] = useState("");
    const [creating, setCreating] = useState(false);
    const [listTitle, setListTitle] = useState(data.title);
    const [listPos, setListPos] = useState(data.pos);
    const [updating, setUpdating] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateCardClick = () => {
        setCreateModalOpen(true);
    };
    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
    };

    const onCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newCardTitle.trim()) return;

        setUpdating(true);
        setError(null);

        try {
            const result = await createCard(data.boardId, data.id, newCardTitle.trim(), newCardDesc.trim(), currentCardPos);
            handleCloseCreateModal();
            if (result && result.id) {
                setCurrentCardPos(currentCardPos + 1);
                // TODO: Refresh cards
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create list");
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateClick = () => {
        setUpdateModalOpen(true);
    };
    const handleCloseUpdateModal = () => {
        setUpdateModalOpen(false);
    };

    const onListUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !listTitle.trim()) return;

        setCreating(true);
        setError(null);

        try {
            const result = await updateList(data.boardId, data.id, listTitle.trim(), listPos)
            handleCloseUpdateModal();
            if (result) {
                // TODO: Refresh list
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create list");
        } finally {
            setCreating(false);
        }
    };

    const cardItems = data.cards.sort((a, b) => a.pos - b.pos).map(card =>
        <li key={"list_" + data.pos + "_card_" + card.pos} className="card-wrapper">
            <Card pos={card.pos} title={card.title} desc={card.desc} assignees={card.assignees} labels={card.labels}/>
        </li>
    );

    let createCardLabel = "Add a card";
    if (cardItems.length === 0)
        createCardLabel = "Add your first card";
    cardItems.push(
        <li key={"list_" + data.pos + "_button"} className="card-add">
            <button className="card-add-btn" onClick={handleCreateCardClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>{createCardLabel}</span>
            </button>
        </li>
    )

    return (
        <>
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={handleCloseCreateModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create Card</h1>
                                <button className="modal-close" onClick={handleCloseCreateModal}>
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
                                        placeholder="My new card"
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
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newCardTitle.trim()}>
                                    {creating ? "Creating..." : "Create List"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {isUpdateModalOpen && (
                <div className="modal-overlay" onClick={handleCloseUpdateModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Change list title</h1>
                                <button className="modal-close" onClick={handleCloseUpdateModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onListUpdate}>
                                <label className="auth-field">
                                    <span className="auth-label">List title</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={listTitle}
                                        onChange={(e) => setListTitle(e.target.value)}
                                        placeholder="List title"
                                        required
                                        autoFocus
                                    />
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !listTitle.trim()}>
                                    {creating ? "Applying..." : "Apply"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <div className={"list"}>
                <div className="list-header">
                    <h2 className="list-header-title">{data.title}</h2>
                    <button className="list-header-btn tool-button" onClick={handleUpdateClick}>
                        <svg width="24" height="24" role="presentation" focusable="false" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14ZM21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z"
                                  fill="currentColor"></path>
                        </svg>
                    </button>
                </div>
                <div className="cards-wrapper">
                    <ul className="cards">{cardItems}</ul>
                </div>
            </div>
        </>
    );
}