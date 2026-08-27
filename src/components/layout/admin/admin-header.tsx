"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ADMIN_NAV_ITEMS } from "@/config/admin-navigation";
import { SkeletonText } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SITE_CONFIG } from "@/config/site";
import { useGetMeQuery } from "@/services/auth-api";
import { useAuthLogout } from "@/lib/use-auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser } from "@/redux/slices/authSlice";

export function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, error } = useGetMeQuery();
  const { handleLogout } = useAuthLogout();

  useEffect(() => {
    if (data?.user) dispatch(setUser(data.user));
  }, [data, dispatch]);

  useEffect(() => {
    const status = (error as { status?: number } | undefined)?.status;
    if (status === 401) {
      window.location.replace("/login?loggedOut=1");
    }
  }, [error]);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 px-5 lg:px-8 bg-white/90 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between transition-all">
      {/* Mobile Bar / Brand */}
      <div className="lg:hidden flex items-center gap-2.5">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-primary p-1 rounded-lg"
          aria-label="Toggle Navigation"
        >
          <span className="material-symbols-outlined text-xl">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
        <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-6 w-6 object-contain" />
        <span className="font-extrabold text-primary tracking-tight text-base">VKS AUTOSERVICES ADMIN</span>
      </div>

      {/* Admin Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications Icon */}
        <Link href="/admin/notifications" title="Notifications" className="relative cursor-pointer hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
        </Link>

        {/* Admin Profile Badge */}
        <Link href="/admin/profile" title="My Profile" className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/30 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="text-right hidden sm:block">
            {isLoading ? (
              <div className="space-y-1.5">
                <SkeletonText className="w-20" />
                <SkeletonText className="w-28" />
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-on-surface leading-tight">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{user?.email || ""}</p>
              </>
            )}
          </div>
          {isLoading ? (
            <SkeletonText className="w-8 h-8 rounded-full" />
          ) : (
            <UserAvatar name={user?.name} image={user?.avatar} fallback="Platform Admin" size="sm" />
          )}
        </Link>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-outline-variant/30 p-4 space-y-2.5 shadow-xl z-50">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2 text-xs font-bold text-on-surface hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
            <button onClick={handleLogout} className="text-left py-2 text-xs font-bold text-error">
              Exit Admin Portal
            </button>
            <span className="text-[10px] text-outline shrink-0">
              Version {SITE_CONFIG.version}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
