import {User} from "@/app/components/user";
import MemberMedal from "@/app/components/memberMedal";

export interface BoardData {
    id: number;
    title: string;
    owner: User;
    members: User[];
}

export default function Board(data: BoardData) {
    const membersMedals = data.members.map(member =>
        <li key={"medal_" + member.id}>
            <MemberMedal key={"medal_" + member.id} member={member}/>
        </li>
    );
    membersMedals.unshift(
        <li key={"medal_" + data.owner.id}>
            <MemberMedal key={"medal_" + data.owner.id} member={data.owner}/>
        </li>
    )

    return (
        <a href={"app/board?id=" + data.id}>
            <div className="board-card hover:brightness-110 transition-all">
                <h2 className={"board-card-title"}>{data.title}</h2>
                <ul className="board-card-members flex -space-x-2">
                    {membersMedals}
                </ul>
            </div>
        </a>
    );
}
