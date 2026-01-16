"use client";

import React, {useEffect, useState} from "react";
import * as jose from "jose"
import {usePathname, useRouter} from "next/navigation";
import {User, UserContext} from "@/app/components/user";
import {JWT_SECRET} from "@/app/secrets";
import "./app.css";
import {client} from "@/app/http/client";

async function isTokenValid(token: string): Promise<User | null> {
    try {
        const key = new TextEncoder().encode(JWT_SECRET);

        const {payload} = await jose.jwtVerify(token, key, {
            algorithms: ["HS256"],
        });

        const exp = payload.exp;
        if (typeof exp !== "number") return null;
        const now = Math.floor(Date.now() / 1000);
        if (exp <= now) return null;

        if (typeof payload.user_id === "number" && typeof payload.email === "string") {
            const res = await client.get("user/" + payload.user_id);

            return {
                id: payload.user_id,
                email: payload.email,
                firstName: res.data.first_name,
                lastName: res.data.last_name
            };
        }
        return null;
    } catch {
        return null;
    }
}

export default function AppLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const run = async () => {
            const token = localStorage.getItem("taskly_jwt");
            const next = encodeURIComponent(pathname || "/app");

            if (!token) {
                router.replace(`/login?next=${next}`);
                return;
            }

            const user = await isTokenValid(token);
            if (!user) {
                localStorage.removeItem("taskly_jwt");
                router.replace(`/login?next=${next}`);
                return;
            }

            setUser(user);
            setChecked(true);
        };

        run();
    }, [router, pathname]);

    if (!checked) return null;
    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    );
}
