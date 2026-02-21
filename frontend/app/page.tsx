import {metadata} from "@/app/metadata";
import {FeatureCard, FeatureCardData} from "@/app/components/FeatureCard";

export default function Home() {
    metadata.title = "Taskly"

    const featuresListData: FeatureCardData[] = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-panels-top-left size-6 text-[#0E6BA8]">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M3 9h18"></path>
                <path d="M9 21V9"></path>
            </svg>,
            title: "Kanban Boards",
            description: "Visualize your workflow with intuitive drag-and-drop boards and lists. Organize tasks exactly how you want."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users size-6 text-[#0E6BA8]">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>,
            title: "Team Collaboration",
            description: "Invite unlimited team members, assign tasks, and track progress together in real-time."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-circle-check size-6 text-[#0E6BA8]">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
            </svg>,
            title: "Task Management",
            description: "Create detailed tasks with descriptions, labels, attachments, and comments to keep everyone aligned."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap size-6 text-[#0E6BA8]">
                <path
                    d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
            </svg>,
            title: "Lightning Fast",
            description: "Built with modern React and optimized for performance. Works smoothly even with hundreds of tasks."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock size-6 text-[#0E6BA8]">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>,
            title: "Secure & Private",
            description: "Your data is yours. Self-host or use our secure cloud. We never sell your data."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock size-6 text-[#0E6BA8]">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>,
            title: "Responsive Design",
            description: "Works beautifully on desktop, tablet, and mobile. Manage your projects from anywhere."
        }
    ]

    const featuresList = featuresListData.map((data: FeatureCardData, index: number) =>
        <FeatureCard key={index} icon={data.icon} title={data.title} description={data.description}/>
    )

    const validIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                           className="lucide lucide-circle-check size-5 text-[#0E6BA8] shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="m9 12 2 2 4-4"></path>
    </svg>;

    return (
        <div className="welcomepage-wrapper">
            <div className={"welcomepage-header"}>
                <h1>Project Management, Simplified & Open</h1>
                <p>
                    A powerful, free, and open-source project management tool built for modern teams.
                    Organize tasks, collaborate seamlessly, and ship faster.
                </p>
                <div className={"welcomepage-header-btns"}>
                    <a className={"welcomepage-header-btn get-started-btn"}>
                        <span>Get Started</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-arrow-right ml-2 size-5">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </a>
                    <a className={"welcomepage-header-btn view-gh-btn"}>
                        <svg fill="currentColor" viewBox="0 -0.5 25 25" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path
                                    d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z"></path>
                            </g>
                        </svg>
                        <span>View on Github</span>
                    </a>
                </div>
                <ul className={"welcomepage-numbers"}>
                    <li>
                        <h2>100%</h2>
                        <span>Free Forever</span>
                    </li>
                    <li>
                        <h2>Open</h2>
                        <span>Source</span>
                    </li>
                    <li>
                        <h2>∞</h2>
                        <span>No Limits</span>
                    </li>
                </ul>
            </div>
            <div className={"welcomepage-features"} id={"features"}>
                <h1 className={"welcomepage-title"}>Everything You Need to Manage Projects</h1>
                <span className={"welcomepage-subtitle"}>Built with the latest technologies and designed for teams of all sizes</span>
                <div className={"features-list"}>{featuresList}</div>
            </div>
            <div className={"welcomepage-pricing"} id={"pricing"}>
                <h1 className={"welcomepage-title"}>Simple, Transparent Pricing</h1>
                <span className={"welcomepage-subtitle"}>No hidden fees, no credit card required. Forever.</span>
                <div className={"pricing-card"}>
                    <div className={"pricing-card-header"}>
                        <h3 className={"pricing-card-header-title"}>Free Forever</h3>
                        <div className="flex items-baseline justify-center gap-2 mb-4">
                            <span className="text-6xl text-[#0E6BA8]">$0</span>
                            <span className="text-zinc-400">/month</span>
                        </div>
                        <p className="text-zinc-400">Everything you need, completely free. No limits.</p>
                    </div>
                    <ul className="pricing-card-features">
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">Unlimited boards and lists</span>
                        </li>
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">Unlimited team members</span>
                        </li>
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">Task assignments and labels</span>
                        </li>
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">File attachments</span>
                        </li>
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">Comments and collaboration</span>
                        </li>
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">Self-hosting option (coming soon)</span>
                        </li>
                        <li className="pricing-card-feature">
                            {validIcon}
                            <span className="text-zinc-300">Community support</span>
                        </li>
                    </ul>
                    <a href="/app">Get Started Now</a>
                </div>
            </div>
            <div className={"welcomepage-opensource"} id={"open-source"}>
                <div className={"welcomepage-opensource-os"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code size-4 text-[#0E6BA8]">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    <span>Open Source</span>
                </div>
                <h1>Built in the Open</h1>
                <span>Taskly is completely open-source and community-driven. Transparent, secure, and free forever.</span>
                <div className={"welcomepage-opensource-cards"}>
                    <div className={"opensource-card"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-github size-8 text-[#0E6BA8]">
                            <path
                                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                            <path d="M9 18c-4.51 2-5-2-7-2"></path>
                        </svg>
                        <h2 className={"opensource-card-title"}>MIT License</h2>
                        <span
                            className={"opensource-card-desc"}>Use it, modify it, distribute it. The code is yours to explore and improve.</span>
                    </div>
                    <div className={"opensource-card"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-heart size-8 text-[#0E6BA8]">
                            <path
                                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                        <h2 className={"opensource-card-title"}>Community Driven</h2>
                        <span className={"opensource-card-desc"}>Join hundreds of contributors making Taskly better every day.</span>
                    </div>
                    <div className={"opensource-card"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-code size-8 text-[#0E6BA8]">
                            <polyline points="16 18 22 12 16 6"></polyline>
                            <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        <h2 className={"opensource-card-title"}>Modern Stack</h2>
                        <span className={"opensource-card-desc"}>Join hundreds of contributors making Taskly better every day.</span>
                    </div>
                </div>
            </div>
            <div className={"welcomepage-getstarted"}>
                <div className={"get-started-card"}>
                    <h1>Ready to Get Started?</h1>
                    <span>Join teams around the world using Taskly to ship better products faster. No credit card required.</span>
                    <a className={"welcomepage-header-btn get-started-btn"}>
                        <span>Get Started</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             className="lucide lucide-arrow-right ml-2 size-5">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}