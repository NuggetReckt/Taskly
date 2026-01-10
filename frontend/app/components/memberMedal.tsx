import {User} from "@/app/components/user";

export interface MemberMedalData {
    member: User;
    size?: number
}

export default function MemberMedal(data: MemberMedalData) {
    return (
        <div className="member-medal member-medal-s">
            {getUserInitials(data.member)}
        </div>
    )
}

function getUserInitials(user: User) {
    if (!user.firstName || !user.lastName) return (
        <span className="member-medal-initials text-xs">{user.email.charAt(0)}</span>
    )
    let s = user.firstName?.charAt(0) + user.lastName?.charAt(0);
    return <span className="member-medal-initials text-xs">{s.toUpperCase()}</span>;
}