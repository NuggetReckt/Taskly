"use client";

import {useState, useEffect} from "react";
import Board, {BoardData} from "@/app/components/board";
import {fetchMemberBoards, fetchUserBoards} from "@/app/http/boards";
import {useUser} from "@/app/components/user";

export default function Page() {
    const user = useUser();
    const [owningBoards, setOwningBoards] = useState<BoardData[]>([]);
    const [memberBoards, setMemberBoards] = useState<BoardData[]>([]);
    const [filteredOwningBoards, setFilteredOwningBoards] = useState<BoardData[]>([]);
    const [filteredMemberBoards, setFilteredMemberBoards] = useState<BoardData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

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
            <p>Chargement des boards...</p>
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
        <li key="board_" className="board-item">
            <div className="board-card create-board-card hover:brightness-110 transition-all">
                <div className="create-board-plus size-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-6 text-white"
                         data-fg-d3bl21="0.8:15.7152:/src/app/App.tsx:162:21:5377:38:e:Plus::::::CSOO">
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
            <div className="app-header">
                <h1>Boards</h1>
                <div className="boards-search-bar relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                         className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400"
                         data-fg-d3bl7="0.8:15.7152:/src/app/App.tsx:130:13:3808:84:e:Search::::::9kM">
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