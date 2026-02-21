"use client"

import React, {Suspense, useEffect, useState} from "react";
import {useUser} from "@/app/components/user";
import {addMemberToBoard, fetchBoard, fetchBoardInvite} from "@/app/http/boards";
import {useRouter, useSearchParams} from "next/navigation";
import {BoardInviteData} from "@/app/components/inviteCard";
import {BoardData} from "@/app/components/board";

export default function Page() {
    return (
        <Suspense fallback={<p>Loading invite details...</p>}>
            <InvitePageContent />
        </Suspense>
    );
}

function InvitePageContent() {
    const user = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inviteData, setInviteData] = useState<BoardInviteData>();
    const [boardData, setBoardData] = useState<BoardData>();

    const code = searchParams.get('code');

    const onInviteAccept = async () => {
        if (!user || !boardData || !inviteData) return;

        try {
            const result = await addMemberToBoard(boardData.id, user.id, inviteData.role);
            if (result) {
                router.replace("/app/board?id=" + boardData.id);
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to create invite");
        }
    }

    useEffect(() => {
        if (user === undefined) return;

        if (!code || code === "") {
            router.replace(`/`);
            return;
        }
        if (!user) {
            router.replace(`/login?next=invite?code=${code}`);
            return;
        }

        fetchBoardInvite(code)
            .then((data) => {
                setInviteData(data);
                fetchBoard(data.boardId).then(boardData => setBoardData(boardData));
            })
            .catch((error) => {
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user, code]);

    if (error) {
        return (
            <p>Une erreur est survenue: {error}</p>
        );
    }
    if (loading) {
        return (
            <p>Chargement des détails de l'invitation...</p>
        );
    }

    return (
        <div>
            <p>{code + " -> " + inviteData?.role}</p>
            <p>Joining {boardData?.owner.firstName} Board?</p>
            <button onClick={onInviteAccept}>Join</button>
        </div>
    )
}
