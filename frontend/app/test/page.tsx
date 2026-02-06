"use client"

import React, {useState} from 'react';
import {DndContext, useDraggable, useDroppable} from '@dnd-kit/core';

function Droppable(props: any) {
    const {isOver, setNodeRef} = useDroppable({
        id: props.id,
        data: {
            type: 'droppable',
            pos: 0
        },
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {props.children}
        </div>
    );
}

function Draggable(props: any) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id,
        data: {
            supports: ['droppable'],
            pos: 1
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {props.children}
        </button>
    );
}

export default function Page() {
    const containers = ['A', 'B', 'C', 'D'];
    const [parent, setParent] = useState(null);
    const draggableMarkup = (
        <Draggable id="draggable">Drag me</Draggable>
    );

    return (
        <div>
            <DndContext onDragEnd={handleDragEnd}>
                {parent === null ? draggableMarkup : null}

                {containers.map((id) => (
                    // We updated the Droppable component so it would accept an `id`
                    // prop and pass it to `useDroppable`
                    <Droppable key={id} id={id}>
                        {parent === id ? draggableMarkup : id}
                    </Droppable>
                ))}
            </DndContext>
        </div>
    );

    function handleDragEnd(event: any) {
        const {active, over} = event;

        // If the item is dropped over a container, set it as the parent
        // otherwise reset the parent to `null`

        console.log("Moving " + active.data.current.pos + " into " + over.id)
        
        if (over && active.data.current.supports.includes(over.data.current.type)) {
            setParent(over ? over.id : null);
        }
    }
};