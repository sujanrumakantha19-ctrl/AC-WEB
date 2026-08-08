import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/helpers";

export function UserAvatar({
  name,
  image,
  fallback = "User",
  size = "md",
  className,
}: {
  name?: string;
  image?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-primary text-white font-extrabold flex items-center justify-center shadow-xs border border-primary-container shrink-0 overflow-hidden",
        sizes[size],
        className
      )}
    >
      {image ? (
        <img src={image} alt={name || fallback} className="w-full h-full object-cover" />
      ) : (
        getInitials(name, fallback)
      )}
    </div>
  );
}
