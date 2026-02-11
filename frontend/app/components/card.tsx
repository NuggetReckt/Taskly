import {BoardMemberData} from "@/app/components/boardView";
import {User} from "@/app/components/user";
import Label, {LabelData} from "@/app/components/label";
import MemberMedal from "@/app/components/memberMedal";
import {useDraggable, useDroppable} from "@dnd-kit/core";

export interface CardData {
    id: number;
    listId?: number;
    pos: number;
    title: string;
    desc: string;
    assignees: BoardMemberData[];
    labels: LabelData[];
}

export interface BoardCardCommentData {
    author: User;
    content: string;
    // Date
}

export interface BoardCardDetailsData {
    id: number;
    card: CardData;
    comments: BoardCardCommentData[];
}

export default function Card(data: CardData & { onClick?: () => void }) {
    const {attributes, listeners, setNodeRef: setDraggableNodeRef, transform} = useDraggable({
        id: `card-${data.id}`,
        data: {
            type: "card",
            cardId: data.id,
            listId: data.listId,
            pos: data.pos
        },
    });
    const {setNodeRef: setDroppableNodeRef, isOver} = useDroppable({
        id: `card-drop-${data.id}`,
        data: {
            type: "card",
            listId: data.listId,
            pos: data.pos
        }
    });
    const setNodeRef = (node: HTMLDivElement | null) => {
        setDroppableNodeRef(node);
        setDraggableNodeRef(node);
    };
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    const labels = data.labels.map(label =>
        <Label key={label.name} name={label.name} color={label.color} min={true}/>
    );
    const assignees = data.assignees.map(assignee =>
        <MemberMedal key={"medal_" + assignee.user.id} member={assignee.user}/>
    )

    return (
        <div className="card-wrapper" ref={setNodeRef} {...listeners} {...attributes} onClick={data.onClick}
             style={{cursor: data.onClick ? 'pointer' : 'default', outline: isOver ? "2px solid #5b94ff" : undefined, ...style}}>
            <div className="card">
                {labels.length >= 1 && (<div className="card-labels">
                    {labels}
                </div>)}
                <h1 className="card-title">{data.title}</h1>
                {assignees.length >= 1 && (<ul className="assignees flex -space-x-2">
                    {assignees}
                </ul>)}
            </div>
        </div>
    );
}
