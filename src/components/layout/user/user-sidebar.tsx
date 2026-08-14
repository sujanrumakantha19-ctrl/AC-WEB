"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/config/site";
import { useAuthLogout } from "@/lib/use-auth";

export function UserSidebar() {
  const pathname = usePathname();
  const { handleLogout } = useAuthLogout();

  const menuItems = [
    { label: "Dashboard", href: "/user/dashboard", icon: "dashboard" },
    { label: "Auctions", href: "/user/auctions", icon: "campaign" },
    { label: "Auction Room", href: "/user/live", icon: "gavel" },
    { label: "My Auctions", href: "/user/my-auctions", icon: "emoji_events" },
    { label: "Purchase History", href: "/user/purchases", icon: "history" },
    { label: "Payment History", href: "/user/payments", icon: "payments" },
    { label: "Notifications", href: "/user/notifications", icon: "notifications" },
    { label: "My Profile", href: "/user/profile", icon: "settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/40 py-5 z-50">
      {/* Brand Logo */}
      <div className="px-5 mb-6 flex items-center gap-2.5">
        <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-7 w-7 object-contain" />
        <span className="text-base font-bold text-primary tracking-tight">
          VKS AUTOSERVICES
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/user/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
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
          <span>Log Out</span>
        </button>
        <p className="text-center text-[10px] text-outline mt-2.5">
          Version {SITE_CONFIG.version}
        </p>
      </div>
    </aside>
  );
}
