"use client";
import React from "react";
import { cn } from "@/lib/utils";

function Item({ i, openIndex, setOpenIndex, q, a }) {
  const isOpen = openIndex === i;
  const contentRef = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (isOpen) {
      const h = el.scrollHeight;
      setHeight(h);
      const onEnd = () => setHeight("auto");
      el.addEventListener("transitionend", onEnd, { once: true });
      return () => el.removeEventListener("transitionend", onEnd);
    } else {
      if (height === "auto") {
        const h = el.scrollHeight;
        setHeight(h);
        el.offsetHeight;
      }
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div
      className={cn(
        "group",
        i % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.02]"
      )}
      data-state={isOpen ? "open" : "closed"}
    >
      <button
        type="button"
        onClick={() => setOpenIndex(isOpen ? null : i)}
        aria-expanded={isOpen}
        aria-controls={`faq-content-${i}`}
        id={`faq-trigger-${i}`}
        className={cn(
          "w-full text-left px-4 md:px-6 py-4 md:py-5",
          "font-medium flex items-center justify-between",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/70"
        )}
      >
        <span>{q}</span>
        <svg
          className={cn(
            "h-4 w-4 opacity-70 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      <div
        id={`faq-content-${i}`}
        role="region"
        aria-labelledby={`faq-trigger-${i}`}
        className="overflow-hidden transition-[height] duration-300 ease-out"
        style={{ height }}
        ref={contentRef}
      >
        <div className="px-4 md:px-6 pb-4 text-sm text-white/70">{a}</div>
      </div>
    </div>
  );
}

export default function FaqAccordion({ items = [], className, ringed = true }) {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        ringed && "ring-1 ring-white/10 divide-y divide-white/10",
        className
      )}
    >
      {items.map((it, i) => (
        <Item
          key={i}
          i={i}
          q={it.q}
          a={it.a}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
        />
      ))}
    </div>
  );
}
