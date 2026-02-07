import Image from "next/image";

interface Link {
    href: string;
    text: string;
}

interface FooterSubSectionData {
    title: string;
    links: Link[];
}

export default function FooterSubSection(data: FooterSubSectionData) {
    const links = data.links.map(link =>
        <li key={link.text} className={"footer-subsection-link"}>
            <a href={link.href}>{link.text}</a>
        </li>
    );

    return (
        <div className={"footer-subsection"}>
            <div className={"footer-subsection-header"}>
                <h1>{data.title}</h1>
            </div>
            <div className={"footer-subsection-content"}>
                <ul className={"footer-subsection-links"}>{links}</ul>
            </div>
        </div>
    )
}