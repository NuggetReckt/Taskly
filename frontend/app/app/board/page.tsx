"use client"

import BoardView, {BoardViewData} from "@/app/components/boardView";
import {ListData} from "@/app/components/list";
import {useSearchParams} from "next/navigation";
// import {metadata} from "@/app/layout";

export default function Page() {
    const params = useSearchParams()
    const boardId = params.get('id')

    //TODO: get board by id

    console.log(boardId)

    const boardLists: ListData[] = [
        {
            pos: 0, title: "List 1", cards: [
                {pos: 0, title: "Card 1", description: "Etiam proin inceptos non luctus montes a hac feugiat ullamcorper molestie"},
                {pos: 1, title: "Card 2", description: "Etiam proin inceptos non luctus montes a hac feugiat ullamcorper molestie"}
            ]
        },
        {
            pos: 1, title: "List 2", cards: [
                {pos: 0, title: "Card 1", description: "Etiam proin inceptos non luctus montes a hac feugiat ullamcorper molestie"},
                {pos: 1, title: "Card 2", description: "Etiam proin inceptos non luctus montes a hac feugiat ullamcorper molestie"},
                {pos: 2, title: "Card 2", description: "Etiam proin inceptos non luctus montes a hac feugiat ullamcorper molestie"}
            ]
        },
        {
            pos: 2, title: "List 3", cards: [
                {pos: 0, title: "Card 1", description: "Etiam proin inceptos non luctus montes a hac feugiat ullamcorper molestie"}
            ]
        }
    ]
    const board: BoardViewData = {description: "", owner_id: 0, id: 0, title: "Test 1", owner: "bonjoure orevoire", lists: boardLists};
    // metadata.title = "Taskly - " + board.title;

    return (
        <>
            <h1>Board - {board.title}</h1>
            <div>
                <BoardView id={board.id} title={board.title} owner={board.owner} lists={board.lists} owner_id={board.owner_id}
                           description={board.description}/>
            </div>
        </>
    );
}