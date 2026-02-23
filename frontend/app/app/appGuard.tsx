"use client";

import React, {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useUser} from "@/app/components/user";

export default function AppGuard({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);
    const user = useUser();

    useEffect(() => {
        if (user === undefined) {
            return;
        }

        const next = encodeURIComponent(pathname || "/app");

        if (!user) {
            setChecked(false);
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
