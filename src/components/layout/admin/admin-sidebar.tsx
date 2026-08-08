"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/config/site";
import { useAuthLogout } from "@/lib/use-auth";

type NavItem = (typeof ADMIN_NAV_ITEMS)[number];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const matchLen = (it: NavItem, target: string) => {
    let max = 0;
    for (const p of [it.href, ...(it.activePrefixes || [])]) {
      if (target === p) max = Math.max(max, p.length);
      else if (target.startsWith(p + "/")) max = Math.max(max, p.length + 1);
    }
    return max;
  };
  const resolveActive = (target: string) =>
    ADMIN_NAV_ITEMS.reduce((best, it) => (matchLen(it, target) > matchLen(best, target) ? it : best), ADMIN_NAV_ITEMS[0]);

  // When opened from a specific menu (e.g. detail screen carries ?from=...),
  // highlight that menu; otherwise fall back to pathname-based longest-prefix.
  const fromLen = fromParam ? matchLen(resolveActive(fromParam), fromParam) : 0;
  const activeItem = fromParam && fromLen > 0 ? resolveActive(fromParam) : resolveActive(pathname);
  const activeTarget = fromParam && fromLen > 0 ? fromParam : pathname;

  const { handleLogout } = useAuthLogout();

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/40 py-5 z-50">
      {/* Brand Logo */}
      <div className="px-5 mb-5 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-7 w-7 object-contain" />
          <span className="text-base font-bold text-primary tracking-tight">
            VKS AUTOSERVICES
          </span>
        </Link>
        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-primary/10 text-primary rounded-md border border-primary/20">
          ADMIN
        </span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-outline mb-2">
          Enterprise Management
        </p>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item === activeItem && matchLen(item, activeTarget) > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-container text-white font-bold shadow-xs"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Exit CTA Footer */}
      <div className="px-4 pt-3 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-white border border-error/30 text-error rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-error/5 transition-all"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Exit Admin Portal</span>
        </button>
        <p className="text-center text-[10px] text-outline mt-2.5">
          Version {SITE_CONFIG.version}
        </p>
      </div>
    </aside>
  );
}
