export interface BoardData {
    id: number;
    title: string;
    owner: string;
    owner_id: number;
    description: string;
}

export default function Board(data: BoardData) {
    return (
        <a href={"app/board?id=" + data.id}>
            <div className="board-card hover:brightness-110 transition-all">
                <h2 className={"board-card-title"}>{data.title}</h2>
                <span>{data.owner}</span>
            </div>
        </a>
    );
}
