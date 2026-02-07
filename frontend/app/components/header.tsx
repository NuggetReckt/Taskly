import Image from 'next/image'

export default function Header() {
    return (
        <header className="header-wrapper">
            <div className={"header-section"}>
                <a href="/" className={"footer-logo"}>
                    <Image src={"/logo.png"} alt={"logo"} width={46} height={46}/>
                    <h1>Taskly</h1>
                </a>
            </div>
            <div className={"header-section"}>
                <ul className={"header-links"}>
                    <li className={"header-link"}><a href="#">Features</a></li>
                    <li className={"header-link"}><a href="#">Pricing</a></li>
                    <li className={"header-link"}><a href="#">Open Source</a></li>
                    <li className={"header-link"}>
                        <a href="/login" className={"login-btn"}>Login</a>
                    </li>
                </ul>
            </div>
        </header>
    );
}