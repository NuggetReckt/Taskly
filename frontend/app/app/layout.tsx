"use client";

import React, {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";

export default function AppLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("taskly_jwt");

        if (!token) {
            const next = encodeURIComponent(pathname || "/app");
            router.replace(`/login?next=${next}`);
            return;
        }

        setChecked(true);
    }, [router, pathname]);

    if (!checked) return null;
    return <>{children}</>;
}
