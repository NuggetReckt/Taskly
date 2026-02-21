import Image from 'next/image'
import {useUser} from "@/app/components/user";
import MemberMedal from "@/app/components/memberMedal";
import {useState} from "react";
import {usePathname} from "next/navigation";

export default function Header() {
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const user = useUser();
    const pathname = usePathname();

    let inApp: boolean = false;
    let logged: boolean = false;

    const handleUserClick = () => {
        if (isUserModalOpen) {
            setUserModalOpen(false);
        } else {
            setUserModalOpen(true);
        }
    };

    const handleLogoutClick = () => {
        localStorage.removeItem("taskly_jwt");
        window.location.reload();
    };

    if (user != null)
        logged = true;
    if (pathname.startsWith("/app"))
        inApp = true;

    return (
        <header className="header-wrapper">
            <div className={"header-section"}>
                <a href="/" className={"header-logo"}>
                    <Image src={"/logo.png"} alt={"logo"} width={38} height={38}/>
                    <h1>Taskly</h1>
                </a>
            </div>
            <div className={"header-section"}>
                <ul className={"header-links"}>
                    <li className={"header-link"}><a href="/#features">Features</a></li>
                    <li className={"header-link"}><a href="/#pricing">Pricing</a></li>
                    <li className={"header-link"}><a href="/#open-source">Open Source</a></li>
                    {logged && user && !inApp && (
                        <li className={"header-link"}><a href="/app" className={"login-btn"}>Open App</a></li>
                    )}
                    <li className={"header-link"}>
                        {logged && user && (
                            <button className={"header-user-btn"} onClick={handleUserClick}>
                                <MemberMedal member={user} size={"m"}/>
                            </button>
                        ) || (
                            <a href="/login" className={"login-btn"}>Login</a>
                        )}
                    </li>
                </ul>
            </div>
            {isUserModalOpen && (
                <div className="user-modal">
                    <button className={"logout-btn"} onClick={handleLogoutClick}>Logout</button>
                </div>
            )}
        </header>
    );
}