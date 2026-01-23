import Card from "@/app/components/card";
import {CardData} from "@/app/components/card";
import React, {useState} from "react";
import {createList} from "@/app/http/lists";
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState(user?.firstName + "'s card");
    const [newCardDesc, setNewCardDesc] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateCardClick = () => {
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const onCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newCardTitle.trim()) return;

        setCreating(true);
        setError(null);

        try {
            const result = await createCard(data.boardId, data.id, newCardTitle.trim(), newCardDesc.trim(), currentCardPos);
            handleCloseModal();
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

    const cardItems = data.cards.map(card =>
        <li key={"list_" + data.pos + "_card_" + card.pos} className="card-wrapper">
            <Card pos={card.pos} title={card.title} desc={card.desc} assignees={card.assignees} labels={card.labels}/>
        </li>
    );
    //TODO: order cards by pos

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
            {isModalOpen && (
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
                                        placeholder="My new card"
                                        required
                                        autoFocus
                                    />
                                </label>
                                <label className="auth-field">
                                    <span className="auth-label">Card Desc</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newCardDesc}
                                        onChange={(e) => setNewCardDesc(e.target.value)}
                                        placeholder=""
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
            <div className={"list"}>
                <h2>{data.title}</h2>
                <div className="cards-wrapper">
                    <ul className="cards">{cardItems}</ul>
                </div>
            </div>
        </>
    );
}