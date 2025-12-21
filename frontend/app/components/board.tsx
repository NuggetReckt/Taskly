import {User} from "@/app/components/user";

export interface BoardData {
    id: number;
    title: string;
    owner: User;
    members: User[];
}

interface MemberMedalData {
    member: User;
}

function MemberMedal(data: MemberMedalData) {
    console.log(data.member)
    return (
        <li key={"medal_" + data.member.id} className="member-medal member-medal-s">
            {getUserInitials(data.member)}
        </li>
    )
}

export default function Board(data: BoardData) {
    const membersMedals = data.members.map(member =>
        <MemberMedal key={"medal_" + member.id} member={member}/>
    );

    return (
        <a href={"app/board?id=" + data.id}>
            <div className="board-card hover:brightness-110 transition-all">
                <h2 className={"board-card-title"}>{data.title}</h2>
                <ul className="board-card-members flex -space-x-2">
                    <MemberMedal key={"medal_" + data.owner.id} member={data.owner}/>
                    {membersMedals}
                </ul>
            </div>
        </a>
    );
}

function getUserInitials(user: User) {
    if (!user.firstName || !user.lastName) return (
        <span className="member-medal-initials text-xs">{user.email.charAt(0)}</span>
    )
    let s = user.firstName?.charAt(0) + user.lastName?.charAt(0);
    return <span className="member-medal-initials text-xs">{s.toUpperCase()}</span>;
}