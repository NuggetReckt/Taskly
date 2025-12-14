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
            <h2 className={"board-card"}>{data.title}</h2>
            <span>{data.owner}</span>
        </a>
    );
}
