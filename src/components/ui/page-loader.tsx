import React from "react";
import Image from "next/image";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-16 w-16 object-contain gavel-tap" />
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-extrabold tracking-tight text-primary">VKS AUTOSERVICES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest animate-pulse">
          Loading…
        </span>
      </div>
    </div>
  );
}
