import List, {ListData} from "@/app/components/list";

export interface BoardViewData {
    id: number;
    title: string;
    owner: string;
    owner_id: number;
    description: string;
    lists: ListData[];
    // members, labels, ...
}

export default function BoardView(data: BoardViewData) {
    const listItems = data.lists.map(list =>
        <li key={"list_" + list.pos}>
            <List pos={list.pos} title={list.title} cards={list.cards}/>
        </li>
    );
    //TODO: order lists by pos

    return (
        <div className={"lists"}>
            <ul>{listItems}</ul>
        </div>
    );
}
