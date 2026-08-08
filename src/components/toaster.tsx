"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { dismissToast } from "@/redux/slices/uiSlice";
import { cn } from "@/lib/utils";

const ICONS: Record<string, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
  warning: "warning",
};

const STYLES: Record<string, string> = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-primary text-white",
  warning: "bg-amber-500 text-black",
};

export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dispatch(dismissToast(t.id))}
          className={cn(
            "w-full flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-bold text-left",
            STYLES[t.type]
          )}
        >
          <span className="material-symbols-outlined text-sm shrink-0">{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
        </button>
      ))}
    </div>
  );
}
