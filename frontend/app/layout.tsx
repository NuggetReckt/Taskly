"use client"

import React, {useEffect, useState} from "react";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import {User, UserContext} from "@/app/components/user";
import {isTokenValid} from "@/app/http/auth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        document.title = "Taskly"; /* TEMPORAIRE */

        const run = async () => {
            const token = localStorage.getItem("taskly_jwt");

            if (!token) return;

            const user = await isTokenValid(token);
            if (!user) {
                localStorage.removeItem("taskly_jwt");
                return;
            }
            setUser(user);
        };
        run();
    }, []);

    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="page-wrapper">
            <UserContext.Provider value={user}>
                <Header/>
                {children}
                <Footer/>
            </UserContext.Provider>
        </div>
        </body>
        </html>
    );
}
