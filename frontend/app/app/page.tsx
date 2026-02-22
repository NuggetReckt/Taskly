"use client";

import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Board, {BoardData} from "@/app/components/board";
import {createBoard, fetchMemberBoards, fetchUserBoards} from "@/app/http/boards";
import {useUser} from "@/app/components/user";
import LoadingIcon from "@/app/components/LoadingIcon";

export default function Page() {
    const user = useUser();
    const router = useRouter();
    const [owningBoards, setOwningBoards] = useState<BoardData[]>([]);
    const [memberBoards, setMemberBoards] = useState<BoardData[]>([]);
    const [filteredOwningBoards, setFilteredOwningBoards] = useState<BoardData[]>([]);
    const [filteredMemberBoards, setFilteredMemberBoards] = useState<BoardData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState(user?.firstName + "'s board");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateBoardClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewBoardTitle("");
        setError(null);
    };

    const onCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newBoardTitle.trim()) return;

        setCreating(true);
        setError(null);

        try {
            const result = await createBoard(user.id, newBoardTitle.trim(), "");
            handleCloseModal();
            if (result && result.id) {
                router.push(`/app/board?id=${result.id}`);
            } else {
                // Fallback if ID is not returned
                const updatedBoards = await fetchUserBoards(user.id);
                setOwningBoards(updatedBoards);
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create board");
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        const userId = user.id;

        fetchUserBoards(userId)
            .then((data) => {
                setOwningBoards(data);
                setFilteredOwningBoards(data);
            })
            .catch((error) => {
                console.error("Failed to load boards:", error);
            })
            .finally(() => {
                setLoading(false);
            });
        fetchMemberBoards(userId)
            .then((data) => {
                setMemberBoards(data);
                setFilteredMemberBoards(data);
            })
            .catch((error) => {
                console.error("Failed to load boards:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm, owningBoards, memberBoards]);

    const handleSearch = (term: string) => {
        const lowerCaseTerm = term.toLowerCase();

        setFilteredOwningBoards(
            owningBoards.filter((board) =>
                board.title.toLowerCase().includes(lowerCaseTerm)
            )
        );
        setFilteredMemberBoards(
            memberBoards.filter((board) =>
                board.title.toLowerCase().includes(lowerCaseTerm)
            )
        );
    };

    if (loading) {
        return (
            <LoadingIcon/>
        );
    }

    const owningBoardsList = filteredOwningBoards.map(board =>
        <li key={"board_" + board.id} className="board-item">
            <Board
                id={board.id}
                title={board.title}
                owner={board.owner}
                members={board.members}
            />
        </li>
    );
    const memberBoardsList = filteredMemberBoards.map(board =>
        <li key={"board_" + board.id} className="board-item">
            <Board
                id={board.id}
                title={board.title}
                owner={board.owner}
                members={board.members}
            />
        </li>
    );
    owningBoardsList.push(
        <li key="create_board_btn" className="board-item">
            <div className="board-card create-board-card hover:brightness-110 transition-all" onClick={handleCreateBoardClick}>
                <div className="create-board-plus size-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-6 text-white">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                    </svg>
                </div>
                <span>Create Board</span>
            </div>
        </li>
    )

    return (
        <div className="app-content">
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="auth-card">
                            <div className="modal-header">
                                <h1 className="auth-title">Create Board</h1>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round" className="lucide lucide-x size-5">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            <form className="auth-form" onSubmit={onCreateBoard}>
                                <label className="auth-field">
                                    <span className="auth-label">Board Name</span>
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={newBoardTitle}
                                        onChange={(e) => setNewBoardTitle(e.target.value)}
                                        placeholder="My awesome board"
                                        required
                                        autoFocus
                                    />
                                </label>
                                {error && <p className="auth-error">{error}</p>}
                                <button className="auth-button" type="submit"
                                        disabled={creating || !newBoardTitle.trim()}>
                                    {creating ? "Creating..." : "Create Board"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <div className="app-header">
                <h1>Boards</h1>
                <div className="boards-search-bar relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                         className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input type="text" placeholder="Search boards" onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}/>
                </div>
            </div>
            <div className="boards">
                <div className="boards-owning">
                    <h2 className="boards-list-title">My Boards</h2>
                    <ul className="boards-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {owningBoardsList}
                    </ul>
                </div>
                <div className="boards-member">
                    <h2 className="boards-list-title">Member Boards</h2>
                    <ul className="boards-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {memberBoardsList}
                    </ul>
                </div>
            </div>
        </div>
    );
}