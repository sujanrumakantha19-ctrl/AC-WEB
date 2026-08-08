import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "live" | "primary" | "secondary" | "success" | "warning" | "error" | "outline" | "new";
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "secondary",
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide leading-none transition-colors shrink-0";

  const variants = {
    live: "bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-xs px-3",
    new: "bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-md px-2 py-0.5",
    primary: "bg-primary-container/10 text-primary-container border border-primary-container/20 font-bold",
    secondary: "bg-surface-container-high text-on-surface font-medium",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80 font-bold",
    error: "bg-red-50 text-red-700 border border-red-200/80 font-bold",
    outline: "border border-outline-variant text-on-surface-variant bg-surface-container-low font-medium",
  };

  return (
    <span className={cn(baseStyles, variants[variant], pulse && "opacity-100", className)}
      style={pulse ? { animation: "pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite" } : undefined}
      {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
      {children}
    </span>
  );
}
