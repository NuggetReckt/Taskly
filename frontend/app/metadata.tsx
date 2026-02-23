import type {Metadata} from "next";

export const metadata: Metadata = {
    title: {default: "Taskly", template: "Taskly - %s"},
    description: "Project management, simplified.",
    icons: {
        icon: [
            {
                url: '/logo.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/logo.png',
                media: '(prefers-color-scheme: dark)',
            },
        ],
    },
};
