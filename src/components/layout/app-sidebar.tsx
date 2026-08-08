"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems: SidebarItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Upcoming Auctions", href: "/notice-board", icon: "gavel" },
    { label: "My Profile", href: "/profile", icon: "person" },
    { label: "Notifications", href: "/notifications", icon: "notifications", badge: "3" },
    { label: "Purchase History", href: "/purchases", icon: "history" },
  ];

  const adminItems: SidebarItem[] = [
    { label: "Enterprise Admin", href: "/admin", icon: "admin_panel_settings" },
    { label: "Create Auction", href: "/admin/auctions/create", icon: "add_circle" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-outline-variant/30 hidden lg:flex flex-col min-h-[calc(100vh-5rem)] sticky top-20">
      <div className="p-4 space-y-6 flex-1">
        {/* User Brief Info */}
        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary-container text-white font-bold flex items-center justify-center">
            VK
          </div>
          <div className="overflow-hidden">
            <h4 className="text-label-md font-bold text-on-surface truncate">Vikram Kumar</h4>
            <p className="text-label-sm text-on-surface-variant truncate">Verified Buyer (KYC Approved)</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-outline mb-2">
            Buyer Portal
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-label-md font-medium transition-all",
                  isActive
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      isActive
                        ? "bg-white text-primary-container"
                        : "bg-tertiary-container text-on-tertiary-container"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation Section */}
        <div className="space-y-1 pt-4 border-t border-outline-variant/20">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-outline mb-2">
            Management
          </p>
          {adminItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-label-md font-medium transition-all",
                  isActive
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-outline-variant/20">
        <Link href="/login">
          <button className="flex items-center gap-2 w-full text-left px-3 py-2 text-label-md text-error hover:bg-error-container/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Sign Out</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}
