import {User} from "@/app/components/user";

export interface MemberMedalData {
    member: User;
    size?: string;
}

export default function MemberMedal(data: MemberMedalData) {
    let className: string;
    let textSize: string = "text-xs";

    switch (data.size) {
        case "s":
            className = "member-medal-s";
            break;
        case "m":
            className = "member-medal-m";
            textSize = "text-s";
            break;
        case "l":
            className = "member-medal-l";
            textSize = "text-m";
            break;
        default:
            className = "member-medal-s";
            break;
    }

    return (
        <div className={"member-medal " + className}>
            {getUserInitials(data.member, textSize)}
        </div>
    )
}

function getUserInitials(user: User, size: string) {
    let displayName: string;

    if (!user.firstName || !user.lastName) {
        displayName = user.email.charAt(0);
    } else {
        let s = user.firstName?.charAt(0) + user.lastName?.charAt(0);
        displayName = s.toUpperCase();
    }
    return <span className={"member-medal-initials " + size}>{displayName}</span>;
}