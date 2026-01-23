import List, {ListData} from "@/app/components/list";
import {User, useUser} from "@/app/components/user";
import {LabelData} from "@/app/components/label";
import React, {useState} from "react";
import {createList} from "@/app/http/lists";

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
    const [newListTitle, setNewListTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateListClick = () => {
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const onCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newListTitle.trim()) return;

        setCreating(true);
        setError(null);

        try {
            const result = await createList(data.id, newListTitle.trim(), currentListPos);
            handleCloseModal();
            if (result && result.id) {
                setCurrentListPos(currentListPos + 1);
                // TODO: Refresh lists
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create list");
        } finally {
            setCreating(false);
        }
    };

    const listItems = data.lists.map(list =>
        <li key={"list_" + list.pos} className="list-wrapper">
            <List id={list.id} boardId={list.boardId} pos={list.pos} title={list.title} cards={list.cards}/>
        </li>
    );
    //TODO: order lists by pos

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
                    <button data-slot="button" className="tool-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-5">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </button>
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
            <div className="lists-wrapper">
                <ul className="lists">{listItems}</ul>
            </div>
        </div>
    );
}
