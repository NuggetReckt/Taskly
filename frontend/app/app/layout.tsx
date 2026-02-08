"use client";

import React, {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useUser} from "@/app/components/user";
import "./app.css";

export default function AppLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);
    const user = useUser();

    useEffect(() => {
        const next = encodeURIComponent(pathname || "/app");
        const token = localStorage.getItem("taskly_jwt");

        if (!user) {
            if (token) {
                setChecked(true);
                return;
            }
            router.replace(`/login?next=${next}`);
            return;
        }

        setChecked(true);
    }, [router, pathname, user]);

    if (!checked) return null;
    return (
        <>
            {children}
        </>
    );
}
