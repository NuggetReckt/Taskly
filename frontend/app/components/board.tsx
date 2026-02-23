import {User, useUser} from "@/app/components/user";
import MemberMedal from "@/app/components/memberMedal";
import React, {useEffect, useState} from "react";
import {createBoard, fetchUserBoards, removeBoardMember} from "@/app/http/boards";

export interface BoardData {
    id: number;
    title: string;
    owner: User;
    members: User[];
    owning?: boolean;
}

export default function Board(data: BoardData) {
    const user = useUser();
    const [leaveModalOpened, setLeaveModalOpened] = useState(false);

    useEffect(() => {
        if (!user) return;
    }, [user]);

    const membersMedals = data.members.map(member =>
        <li key={"medal_" + member.id}>
            <MemberMedal key={"medal_" + member.id} member={member}/>
        </li>
    );
    membersMedals.unshift(
        <li key={"medal_" + data.owner.id}>
            <MemberMedal key={"medal_" + data.owner.id} member={data.owner}/>
        </li>
    )

    const onLeaveButtonClick = async (event: any) => {
        if (!user) return;

        event.preventDefault();
        event.stopPropagation();
        try {
            const result = await removeBoardMember(data.id, user.id);
            if (result) {
                window.location.reload();
            }
        } catch (err: any) {
            console.error(err?.message ?? "Failed to create board");
        }
    }

    return (
        <div className="board-card-wrapper">
            <a href={"app/board?id=" + data.id}>
                <div className="board-card hover:brightness-110 transition-all">
                    <div className={"board-card-header"}>
                        <h2 className={"board-card-title"}>{data.title}</h2>
                        {!data.owning && (
                            <div className="board-card-actions">
                                <button
                                    className="board-card-btn"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setLeaveModalOpened(!leaveModalOpened);
                                    }}>
                                    <svg width="24" height="24" role="presentation" focusable="false" viewBox="0 0 24 24"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14ZM21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z"
                                              fill="currentColor"></path>
                                    </svg>
                                </button>
                                {leaveModalOpened && (
                                    <div className={"board-leave-modal"}>
                                        <button
                                            className={"logout-btn"}
                                            onClick={(event) => onLeaveButtonClick(event)}>
                                            Leave Board
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <ul className="board-card-members flex -space-x-2">
                        {membersMedals}
                    </ul>
                </div>
            </a>
        </div>
    );
}
