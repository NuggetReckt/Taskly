import Image from 'next/image'
import FooterSubSection from "@/app/components/FooterSubSection";

export default function Footer() {
    const subSections = (
        <>
            <FooterSubSection title={"Product"} links={[
                {href: "#", text: "Features"},
                {href: "#", text: "Pricing"},
                {href: "#", text: "Open Source"},
                {href: "#", text: "Get Started"}
            ]}/>
            <FooterSubSection title={"Resources"} links={[
                {href: "#", text: "Documentation"},
                {href: "#", text: "API Reference"},
                {href: "#", text: "Community"},
                {href: "#", text: "Blog"}
            ]}/>
            <FooterSubSection title={"Legal"} links={[
                {href: "#", text: "Privacy Policy"},
                {href: "#", text: "Terms of Service"},
                {href: "#", text: "Cookie Policy"},
                {href: "#", text: "License"}
            ]}/>
        </>
    );

    return (
        <footer className="footer-wrapper">
            <div className={"footer-section footer-top"}>
                <div className={"footer-subsection"}>
                    <div className={"footer-subsection-header"}>
                        <a href="/" className={"header-logo"}>
                            <Image src={"/logo.png"} alt={"logo"} width={38} height={38}/>
                            <h1>Taskly</h1>
                        </a>
                    </div>
                    <div className={"footer-subsection-content"}>
                        <p>Free and open-source project management tool for modern teams.</p>
                        <a href="#">View on GitHub</a>
                    </div>
                </div>
                {subSections}
            </div>
            <div className={"footer-section footer-bottom"}>
                <span>© 2026 Taskly. All rights reserved.</span>
                <span>Made with ❤️ by the open-source community</span>
            </div>
        </footer>
    );
}