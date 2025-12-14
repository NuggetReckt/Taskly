import Card, {CardData} from "@/app/components/card";

export interface ListData {
    pos: number;
    title: string;
    cards: CardData[];
    //...
}

export default function List(data: ListData) {
    const listItems = data.cards.map(card =>
        <li key={"card_" + card.pos}>
            <Card pos={card.pos} title={card.title} description={card.description}/>
        </li>
    );
    //TODO: order cards by pos

    return (
        <div className={"list"}>
            <h2>{data.title}</h2>
            <div>
                <ul>{listItems}</ul>
            </div>
        </div>
    );
}