"use client"

import React, {useState, useEffect} from "react";
import BoardView, {BoardViewData} from "@/app/components/boardView";
import {ListData} from "@/app/components/list";
import {useSearchParams, useRouter} from "next/navigation";
import {useUser} from "@/app/components/user";
import {fetchBoardDetails, fetchUserBoards} from "@/app/http/boards";
import "./board.css"
// import {metadata} from "@/app/layout";

export default function Page() {
    const params = useSearchParams()
    const boardId = params.get('id')
    const user = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [boardView, setBoardView] = useState<BoardViewData>();

    useEffect(() => {
        if (!user) return;
        if (!boardId) {
            router.replace(`/app`);
            return;
        }

        fetchBoardDetails(parseInt(boardId))
            .then((data) => {
                setBoardView(data);
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
            <p>Chargement du board...</p>
        );
    }
    if (!boardView) {
        return (
            <p>Une erreur est survenue lors du chargement du board</p>
        );
    }
    // metadata.title = "Taskly - " + board.title;

    return (
        <div className="board-wrapper">
            <BoardView id={boardView.id} title={boardView.title} owner={boardView.owner} lists={boardView.lists} members={boardView.members}
                       description={boardView.description} labels={boardView.labels}/>
        </div>
    );
}