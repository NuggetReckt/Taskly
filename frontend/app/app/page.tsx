"use client";

import {useState, useEffect} from "react";
import Board, {BoardData} from "@/app/components/board";
import {fetchMemberBoards, fetchUserBoards} from "@/app/http/boards";

export default function Page() {
    const [owningBoards, setOwningBoards] = useState<BoardData[]>([]);
    const [memberBoards, setMemberBoards] = useState<BoardData[]>([]);
    const [loading, setLoading] = useState(true);
    const userId = 1; // Temporaire

    useEffect(() => {
        fetchUserBoards(userId)
            .then((data) => {
                setOwningBoards(data);
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
            })
            .catch((error) => {
                console.error("Failed to load boards:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <p>Chargement des boards...</p>
        );
    }

    const owningBoardsList = owningBoards.map(board =>
        <li key={"board_" + board.id} className="board-item">
            <Board
                id={board.id}
                title={board.title}
                owner={board.owner}
                owner_id={board.owner_id}
                description={board.description}
            />
        </li>
    );
    const memberBoardsList = memberBoards.map(board =>
        <li key={"board_" + board.id} className="board-item">
            <Board
                id={board.id}
                title={board.title}
                owner={board.owner}
                owner_id={board.owner_id}
                description={board.description}
            />
        </li>
    );

    return (
        <div className="app-content">
            <p>App</p>
            <div className="boards">
                <div className="boards-owning">
                    <p>Owning</p>
                    <ul className="boards-list">{owningBoardsList}</ul>
                </div>
                <div className="boards-member">
                    <p>Member</p>
                    <ul className="boards-list">{memberBoardsList}</ul>
                </div>
            </div>
        </div>
    );
}