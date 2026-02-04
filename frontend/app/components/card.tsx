import {BoardMemberData} from "@/app/components/boardView";
import {User} from "@/app/components/user";
import Label, {LabelData} from "@/app/components/label";
import MemberMedal from "@/app/components/memberMedal";

export interface CardData {
    id: number;
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
    const labels = data.labels.map(label =>
        <Label key={label.name} name={label.name} color={label.color} min={true}/>
    );
    const assignees = data.assignees.map(assignee =>
        <MemberMedal key={"medal_" + assignee.user.id} member={assignee.user}/>
    )

    return (
        <div className="card" onClick={data.onClick} style={{cursor: data.onClick ? 'pointer' : 'default'}}>
            {labels.length >= 1 && (<div className="card-labels">
                {labels}
            </div>)}
            <h1 className="card-title">{data.title}</h1>
            {assignees.length >= 1 && (<ul className="assignees flex -space-x-2">
                {assignees}
            </ul>)}
        </div>
    );
}