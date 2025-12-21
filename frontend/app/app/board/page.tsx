"use client"

import {useState, useEffect} from "react";
import BoardView, {BoardViewData} from "@/app/components/boardView";
import {ListData} from "@/app/components/list";
import {useSearchParams} from "next/navigation";
import {router} from "next/dist/client";
// import {metadata} from "@/app/layout";

export default function Page() {
    const params = useSearchParams()
    const boardId = params.get('id')

    //TODO: get board by id
    useEffect(() => {

    }, []);

    if (!boardId) {
        router.replace(`/app`);
    }

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
    const board: BoardViewData = {description: "", id: 0, title: "Test 1", owner: {id: 0, email: "testemail"}, members: [{id: 1, email: "memberemail"},], lists: boardLists};
    // metadata.title = "Taskly - " + board.title;

    return (
        <>
            <h1>Board - {board.title}</h1>
            <div>
                <BoardView id={board.id} title={board.title} owner={board.owner} lists={board.lists} members={board.members}
                           description={board.description}/>
            </div>
        </>
    );
}