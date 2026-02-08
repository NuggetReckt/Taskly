import {User} from "@/app/components/user";

export interface MemberMedalData {
    member: User;
    size?: string;
}

export default function MemberMedal(data: MemberMedalData) {
    let className = "member-medal"

    if (data.size != null) {
        switch (data.size) {
            case "s":
                className += " member-medal-s text-xs"
                break;
            case "m":
                className += " member-medal-m text-s"
                break;
            case "l":
                className += " member-medal-l text-m"
                break;
            default:
                className += " member-medal-s text-xs"
                break;
        }
    }

    return (
        <div className={className}>
            {getUserInitials(data.member)}
        </div>
    )
}

function getUserInitials(user: User) {
    let displayName = "";

    if (!user.firstName || !user.lastName) {
        displayName = user.email.charAt(0);
    } else {
        let s = user.firstName?.charAt(0) + user.lastName?.charAt(0);
        displayName = s.toUpperCase();
    }
    return <span className="member-medal-initials">{displayName}</span>;
}