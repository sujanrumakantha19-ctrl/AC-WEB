import React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable "spec" chip used across auction cards/details
 * (e.g. mileage, fuel, transmission, location).
 */
export function SpecChip({
  icon,
  children,
  className,
}: {
  icon?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-surface-container-low px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] text-on-surface-variant font-medium",
        className
      )}
    >
      {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
      {children}
    </span>
  );
}
