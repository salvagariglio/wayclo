import { useEffect, useRef, useState } from "react";

export default function useScrollReveal({
    threshold = 0.2,
    once = false,
} = {}) {
    const ref = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShow(true);
                    } else if (!once) {
                        setShow(false);
                    }
                });
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [once, threshold]);

    return [ref, show];
}
