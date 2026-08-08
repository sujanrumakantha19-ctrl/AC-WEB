import React from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  loading,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: string;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-2xl flex items-center justify-between shadow-xs min-w-[200px]",
        className
      )}
    >
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant mb-0.5 uppercase tracking-wider">
          {label}
        </p>
        {loading ? (
          <div className="h-6 w-10 animate-pulse bg-surface-container-low rounded-md" />
        ) : (
          <p className="text-lg font-extrabold text-primary">{value}</p>
        )}
      </div>
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      )}
    </div>
  );
}
