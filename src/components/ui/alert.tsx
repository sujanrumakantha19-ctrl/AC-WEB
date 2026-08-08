import React from "react";
import { cn } from "@/lib/utils";

export type AlertVariant = "error" | "success" | "warning" | "info";

const ICONS: Record<AlertVariant, string> = {
  error: "error",
  success: "check_circle",
  warning: "warning",
  info: "info",
};

const STYLES: Record<AlertVariant, string> = {
  error: "bg-error/10 border-error/30 text-error",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
  warning: "bg-amber-50 border-amber-200/80 text-amber-900",
  info: "bg-primary/5 border-primary/20 text-primary",
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
  onDismiss,
}: {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "p-3 rounded-xl text-xs font-medium flex items-start gap-2 border",
        STYLES[variant],
        className
      )}
    >
      <span className="material-symbols-outlined text-sm shrink-0">{ICONS[variant]}</span>
      <div className="flex-1">
        {title && <p className="font-bold mb-0.5">{title}</p>}
        {children}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  );
}
