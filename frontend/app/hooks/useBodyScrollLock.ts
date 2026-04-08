import {useEffect} from "react";

const LOCK_COUNT_ATTR = "data-body-scroll-lock-count";
const ORIGINAL_OVERFLOW_ATTR = "data-body-scroll-original-overflow";
const ORIGINAL_PADDING_ATTR = "data-body-scroll-original-padding-right";

export default function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;

        const body = document.body;
        const lockCount = Number(body.getAttribute(LOCK_COUNT_ATTR) || "0");

        if (lockCount === 0) {
            body.setAttribute(ORIGINAL_OVERFLOW_ATTR, body.style.overflow || "");
            body.setAttribute(ORIGINAL_PADDING_ATTR, body.style.paddingRight || "");

            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            body.style.overflow = "hidden";
            if (scrollbarWidth > 0) {
                body.style.paddingRight = `${scrollbarWidth}px`;
            }
        }

        body.setAttribute(LOCK_COUNT_ATTR, String(lockCount + 1));

        return () => {
            const currentCount = Number(body.getAttribute(LOCK_COUNT_ATTR) || "1");
            const nextCount = Math.max(0, currentCount - 1);

            if (nextCount === 0) {
                const originalOverflow = body.getAttribute(ORIGINAL_OVERFLOW_ATTR) ?? "";
                const originalPaddingRight = body.getAttribute(ORIGINAL_PADDING_ATTR) ?? "";

                body.style.overflow = originalOverflow;
                body.style.paddingRight = originalPaddingRight;

                body.removeAttribute(LOCK_COUNT_ATTR);
                body.removeAttribute(ORIGINAL_OVERFLOW_ATTR);
                body.removeAttribute(ORIGINAL_PADDING_ATTR);
            } else {
                body.setAttribute(LOCK_COUNT_ATTR, String(nextCount));
            }
        };
    }, [locked]);
}
