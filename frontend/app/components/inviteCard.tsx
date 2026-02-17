export interface BoardInviteData {
    id: number;
    boardId: number;
    code: string;
    role: string;
}

export default function InviteCard(data: BoardInviteData) {
    const fullURL = `${window.location.origin}/invite?code=${data.code}`;
    
    function copyURL() {
        navigator.clipboard.writeText(fullURL).then(r => alert("Text has been copied."));
    }

    return (
        <div className="invite-card">
            <div>{data.code} {data.role}</div>
            <button className={"invite-link-copy-btn"} onClick={copyURL}>Copy</button>
        </div>
    );
}