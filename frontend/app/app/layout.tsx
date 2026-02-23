import React from "react";
import "./app.css";
import type {Metadata} from "next";
import AppGuard from "@/app/app/appGuard";

export const metadata: Metadata = {
    title: "App"
};

export default function AppLayout({children}: { children: React.ReactNode }) {
    return (
        <AppGuard>
            {children}
        </AppGuard>
    );
}
