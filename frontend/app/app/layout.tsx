"use client";

import React, {useEffect, useState} from "react";
import * as jose from "jose"
import {usePathname, useRouter} from "next/navigation";
import {JWT_SECRET} from "@/app/secrets";
import "./app.css";

async function isTokenValid(token: string): Promise<boolean> {
    try {
        const key = new TextEncoder().encode(JWT_SECRET);

        const {payload} = await jose.jwtVerify(token, key, {
            algorithms: ["HS256"],
        });

        const exp = payload.exp;
        if (typeof exp !== "number") return false;
        const now = Math.floor(Date.now() / 1000);
        if (exp <= now) return false;

        return true;
    } catch {
        return false;
    }
}

export default function AppLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const run = async () => {
            const token = localStorage.getItem("taskly_jwt");
            const next = encodeURIComponent(pathname || "/app");

            if (!token) {
                router.replace(`/login?next=${next}`);
                return;
            }

            const valid = await isTokenValid(token);
            if (!valid) {
                localStorage.removeItem("taskly_jwt");
                router.replace(`/login?next=${next}`);
                return;
            }

            setChecked(true);
        };

        run();
    }, [router, pathname]);

    if (!checked) return null;
    return <>{children}</>;
}
