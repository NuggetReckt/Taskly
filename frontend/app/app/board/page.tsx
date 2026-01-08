"use client"

import React, {useState, useEffect} from "react";
import BoardView, {BoardViewData} from "@/app/components/boardView";
import {ListData} from "@/app/components/list";
import {useSearchParams, useRouter} from "next/navigation";
import {useUser} from "@/app/components/user";
import {fetchBoardDetails, fetchUserBoards} from "@/app/http/boards";
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

    if (loading || !boardView) {
        return (
            <p>Chargement des boards...</p>
        );
    }
    // metadata.title = "Taskly - " + board.title;

    console.log(boardView)
    return (
        <div>
            <BoardView id={boardView.id} title={boardView.title} owner={boardView.owner} lists={boardView.lists} members={boardView.members}
                       description={boardView.description} labels={boardView.labels}/>
        </div>
    );
}