"use client";

import React, { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";

/**
 * Applies the active theme + font scale to <html>.
 * The initial theme is read before hydration by the inline script in layout.tsx.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s) => s.theme.mode);
  const fontScale = useAppSelector((s) => s.theme.fontScale);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    root.style.fontSize = `${Math.round(16 * fontScale * 100) / 100}px`;
  }, [mode, fontScale]);

  return <>{children}</>;
}
