export interface CardData {
    pos: number;
    title: string;
    description: string
    // assignees, labels, ...
}

export default function Card(data: CardData) {
    return (
        <div>
            <h1>{data.title}</h1>
            <span>{data.description}</span>
        </div>
    );
}