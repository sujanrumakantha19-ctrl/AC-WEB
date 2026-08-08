"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ComboboxProps {
  label?: string;
  placeholder?: string;
  icon?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
}

export const Combobox = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  options,
  required,
  error,
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return list.length > 60 ? list.slice(0, 60) : list;
  }, [query, options]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function onDoc(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  const openList = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(true);
    setHighlightedIndex(0);
  };

  const choose = (option: string) => {
    onChange(option);
    setQuery(option);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { openList(); return; }
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered[highlightedIndex]) {
        choose(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const showDropdown = open && filtered.length > 0;
  const noMatches = open && filtered.length === 0;

  return (
    <div ref={containerRef} className="w-full space-y-1" onBlur={handleBlur}>
      {label && (
        <label className="block text-xs font-bold text-on-surface-variant">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <div className="relative w-full">
        <div className="relative flex items-center w-full">
          {icon && (
            <span className="material-symbols-outlined absolute left-3.5 text-outline text-lg select-none pointer-events-none">
              {icon}
            </span>
          )}
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            value={query}
            placeholder={placeholder}
            required={required}
            onChange={handleInputChange}
            onFocus={openList}
            onClick={openList}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full py-2.5 px-3.5 rounded-xl bg-white text-on-surface text-xs font-medium placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs",
              icon && "pl-10",
              "pr-10",
              error && "border-error focus:border-error focus:ring-error"
            )}
          />
          <button
            type="button"
            onClick={openList}
            aria-label={open ? "Close list" : "Open list"}
            className="absolute right-2 p-1 text-outline hover:text-primary transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-lg select-none pointer-events-none">
              {open ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>

        {showDropdown && (
          <ul
            role="listbox"
            className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white border border-outline-variant shadow-lg text-xs py-1"
            onPointerDown={(e) => e.preventDefault()}
          >
            {filtered.map((option, index) => (
              <li
                key={option}
                role="option"
                aria-selected={index === highlightedIndex}
                onPointerEnter={() => setHighlightedIndex(index)}
                onPointerDown={() => choose(option)}
                className={cn(
                  "px-3.5 py-2 cursor-pointer text-on-surface transition-colors",
                  index === highlightedIndex ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low"
                )}
              >
                {option}
              </li>
            ))}
          </ul>
        )}

        {noMatches && (
          <div
            className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl bg-white border border-outline-variant shadow-lg text-xs py-2 px-3.5 text-on-surface-variant"
            onPointerDown={(e) => e.preventDefault()}
          >
            No matches
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
};