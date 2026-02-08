import {useDroppable} from "@dnd-kit/core";
import React from "react";

interface Props {
    type: string
    id: number,
    pos: number
}

export default function Droppable(props: Props) {
    const {isOver, setNodeRef} = useDroppable({
        id: props.id,
        data: {
            supports: ['droppable'],
            pos: props.pos,
        },
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };

    return (
        <div className={"list-droppable"} ref={setNodeRef} style={style}>
        </div>
    );
}