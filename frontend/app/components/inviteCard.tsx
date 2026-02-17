"use client"

import {useState} from "react";

export interface BoardInviteData {
    id: number;
    boardId: number;
    code: string;
    role: string;
}

export default function InviteCard(data: BoardInviteData) {
    const [isCopied, setCopied] = useState(false);
    const fullURL = `${window.location.origin}/invite?code=${data.code}`;

    function copyURL() {
        navigator.clipboard.writeText(fullURL).then(r => setCopied(true));
    }

    let roleDisplay = ""
    switch (data.role) {
        case "editor":
            roleDisplay = "Editor";
            break;
        case "viewer":
            roleDisplay = "Viewer";
            break;
        case "admin":
            roleDisplay = "Administrator";
            break;
        default:
            roleDisplay = "Unknown";
            break;
    }

    return (
        <div className="invite-card">
            <div className={"invite-card-code"}>{data.code}</div>
            <div className={"invite-card-role"}>{roleDisplay}</div>
            <button className={"invite-link-copy-btn"} onClick={copyURL}>{isCopied && "Copied" || "Copy"}</button>
        </div>
    );
}