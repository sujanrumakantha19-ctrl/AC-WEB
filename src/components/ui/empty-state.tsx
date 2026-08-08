import React from "react";
import Link from "next/link";

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-12 space-y-2">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container-low flex items-center justify-center">
        <span className="material-symbols-outlined text-2xl text-outline">{icon}</span>
      </div>
      <p className="text-sm font-bold text-on-surface">{title}</p>
      {description && (
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-3 px-4 py-2 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
