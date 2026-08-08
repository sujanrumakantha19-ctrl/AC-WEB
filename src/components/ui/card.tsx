import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-xs border border-outline-variant/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
            {icon && <span className="material-symbols-outlined text-primary text-base">{icon}</span>}
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </Card>
  );
}
