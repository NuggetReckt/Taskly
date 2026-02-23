"use client"

import React, {useState, useEffect} from "react";
import BoardView, {BoardViewData} from "@/app/components/boardView";
import {useSearchParams, useRouter} from "next/navigation";
import {useUser} from "@/app/components/user";
import {fetchBoardDetails} from "@/app/http/boards";
import "./board.css"
import LoadingIcon from "@/app/components/LoadingIcon";

export default function Page() {
    const params = useSearchParams()
    const boardId = params.get('id')
    const user = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [boardView, setBoardView] = useState<BoardViewData>();
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("Error while loading user data.");
            return;
        }
        if (!boardId) {
            router.replace(`/app`);
            return;
        }
        const id = parseInt(boardId);

        fetchBoardDetails(id)
            .then((data) => {
                let canAccess = false;

                if (data.owner.id === user.id)
                    canAccess = true
                if (data.members.find(m => m.user.id === user.id))
                    canAccess = true

                if (!canAccess) {
                    setError("Access denied");
                    return;
                }
                setBoardView(data);
            })
            .catch((error) => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [boardId, router, user]);

    if (error) {
        return (
            <div className={"text-center text-red-700"}>
                <p>An error occurred while trying to load board:</p>
                <p>{error}</p>
            </div>
        );
    }
    if (loading || !boardView) {
        return (
            <LoadingIcon/>
        );
    }

    return (
        <div className="board-wrapper">
            <BoardView id={boardView.id} title={boardView.title} owner={boardView.owner} lists={boardView.lists} members={boardView.members}
                       description={boardView.description} labels={boardView.labels} boardStatus={boardView.boardStatus}/>
        </div>
    );
}
