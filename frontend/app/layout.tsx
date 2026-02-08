"use client"

import React, {useEffect, useRef, useState} from "react";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import {UserContext, UserState} from "@/app/components/user";
import {isTokenValid} from "@/app/http/auth";
import {usePathname} from "next/navigation";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const [user, setUser] = useState<UserState>(undefined);
    const lastTokenRef = useRef<string | null>(null);

    useEffect(() => {
        document.title = "Taskly"; /* TEMPORAIRE */

        const run = async () => {
            const token = localStorage.getItem("taskly_jwt");

            if (!token) {
                lastTokenRef.current = null;
                setUser(null);
                return;
            }
            if (user && lastTokenRef.current === null) {
                lastTokenRef.current = token;
                return;
            }
            if (lastTokenRef.current === token) {
                return;
            }

            const validatedUser = await isTokenValid(token);
            if (!validatedUser) {
                localStorage.removeItem("taskly_jwt");
                lastTokenRef.current = null;
                setUser(null);
                return;
            }
            lastTokenRef.current = token;
            setUser(validatedUser);
        };
        run();
    }, [user]);

    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="page-wrapper">
            <UserContext.Provider value={{user, setUser}}>
                <Header/>
                {children}
                <Footer/>
            </UserContext.Provider>
        </div>
        </body>
        </html>
    );
}
