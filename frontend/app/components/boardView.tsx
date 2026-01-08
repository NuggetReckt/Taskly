import List, {ListData} from "@/app/components/list";
import {User} from "@/app/components/user";
import React from "react";

export interface BoardMemberData {
    user: User;
    role: string;
}

export interface BoardLabelData {
    name: string;
    color: string;
}

export interface BoardCardData {
    title: string;
    desc: string;
    assignees: BoardMemberData[];
    labels: BoardLabelData[];
}

export interface BoardCardDetailsData {
    card: BoardCardData;
    // TODO: add comments, activity log...
}

export interface BoardViewData {
    id: number;
    title: string;
    description: string;
    owner: User;
    members: BoardMemberData[];
    lists: ListData[];
    labels: BoardLabelData[];
}

export default function BoardView(data: BoardViewData) {
    const listItems = data.lists.map(list =>
        <li key={"list_" + list.pos}>
            <List pos={list.pos} title={list.title} cards={list.cards}/>
        </li>
    );
    //TODO: order lists by pos

    return (
        <div>
            <h1>Board - {data.title}</h1>
            <div className={"lists"}>
                <ul>{listItems}</ul>
            </div>
        </div>
    );
}
