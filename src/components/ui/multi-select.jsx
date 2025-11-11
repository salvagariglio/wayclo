"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, Search, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MultiSelect (sin shadcn Command/Popover)
 * props:
 *  - options: [{ label, value }]
 *  - value: string[]
 *  - onChange: (arr: string[]) => void
 *  - placeholder?: string
 *  - maxBadges?: number
 *  - className?: string
 */
export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Seleccionar…",
  maxBadges = 3,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
  }, [options, query]);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (!o) setTimeout(() => inputRef.current?.focus(), 0);
      return next;
    });
  };

  const toggleValue = (val) => {
    const exists = value.includes(val);
    onChange?.(exists ? value.filter((v) => v !== val) : [...value, val]);
  };

  const clearOne = (val, e) => {
    e?.stopPropagation();
    onChange?.(value.filter((v) => v !== val));
  };

  const clearAll = (e) => {
    e?.stopPropagation();
    onChange?.([]);
  };

  const selected = options.filter((o) => value.includes(o.value));
  const preview = selected.slice(0, maxBadges);
  const hidden = Math.max(0, selected.length - preview.length);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className={cn(
          "w-full bg-[#101114] border border-white/10 text-white rounded-md px-3 py-2",
          "flex items-center justify-between gap-2"
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 text-left">
          {selected.length === 0 && (
            <span className="text-white/60">{placeholder}</span>
          )}
          {preview.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm bg-white/10 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {opt.label}
              <X
                className="h-3.5 w-3.5 cursor-pointer"
                onClick={(e) => clearOne(opt.value, e)}
              />
            </span>
          ))}
          {hidden > 0 && (
            <span className="rounded px-2 py-0.5 text-sm bg-white/10 border border-white/10">
              +{hidden}
            </span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-60 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 mt-1 rounded-md border border-white/10",
            "bg-[#101114] text-white shadow-lg z-[70]"
          )}
          role="listbox"
        >
          {/* Buscador */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <Search className="h-4 w-4 text-white/50" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
            />
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-white/70 hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-white/60">
                Sin resultados
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleValue(opt.value)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5",
                      isSelected && "bg-white/5"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-sm border grid place-items-center",
                        isSelected
                          ? "bg-[var(--brand)] border-[var(--brand)] text-black"
                          : "border-white/30"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
