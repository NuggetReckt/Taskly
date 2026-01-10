import Card from "@/app/components/card";
import {CardData} from "@/app/components/card";

export interface ListData {
    pos: number;
    title: string;
    cards: CardData[];
    //...
}

export default function List(data: ListData) {
    const cardItems = data.cards.map(card =>
        <li key={"list_" + data.pos + "_card_" + card.pos} className="card-wrapper">
            <Card pos={card.pos} title={card.title} desc={card.desc} assignees={card.assignees} labels={card.labels}/>
        </li>
    );
    //TODO: order cards by pos
    cardItems.push(
        <li key={"list_" + data.pos + "_button"} className="card-add">
            <button className="card-add-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus size-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Add a card</span>
            </button>
        </li>
    )

    return (
        <div className={"list"}>
            <h2>{data.title}</h2>
            <div className="cards-wrapper">
                <ul className="cards">{cardItems}</ul>
            </div>
        </div>
    );
}