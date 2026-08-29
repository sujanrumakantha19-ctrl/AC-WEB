"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PUBLIC_NAV_ITEMS } from "@/config/public-navigation";
import { useGetMeQuery } from "@/services/auth-api";
import { useAppSelector } from "@/redux/hooks";
import { UserAvatar } from "@/components/ui/user-avatar";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const reduxUser = useAppSelector((s) => s.auth.user);
  const { data, isLoading } = useGetMeQuery();
  const user = data?.user || reduxUser;
  const isLoggedIn = !!user;
  const isAdmin = (user as any)?.role === "admin" || (user as any)?.role === "superadmin";
  const dashboardUrl = isAdmin ? "/admin/dashboard" : "/user/dashboard";
  const profileUrl = isAdmin ? "/admin/profile" : "/user/profile";

  return (
    <header className="fixed top-0 z-50 w-full h-20 bg-white/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs">
      <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-container-max mx-auto h-full">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-9 w-9 object-contain" priority />
          <span className="text-xl font-extrabold text-primary tracking-tight">
            VKS AUTOSERVICES
          </span>
        </Link>

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-bold transition-all ${
                  isActive
                    ? "text-primary font-extrabold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Authentication CTAs or Logged-in Dashboard Controls */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardUrl}>
                <button className="px-4 py-2 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  Dashboard
                </button>
              </Link>
              <Link
                href={profileUrl}
                title="My Profile"
                className="flex items-center gap-2 pl-2 border-l border-outline-variant/30 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-on-surface leading-tight truncate max-w-[120px]">
                    {user?.name || "My Account"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant leading-tight">
                    {isAdmin ? "Admin" : "Buyer"}
                  </p>
                </div>
                <UserAvatar name={user?.name} image={user?.avatar} size="sm" />
              </Link>
            </div>
          ) : !isLoading ? (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <button className="px-5 py-2 text-primary font-bold text-xs hover:bg-primary-container/10 rounded-lg transition-all">
                  Login
                </button>
              </Link>
              <Link href="/register" className="hidden sm:inline-block">
                <button className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-secondary transition-all active:scale-95">
                  Register
                </button>
              </Link>
            </>
          ) : null}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-outline-variant/30 px-4 py-4 space-y-3 shadow-lg">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-on-surface font-bold hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-outline-variant/20 flex gap-2">
            {isLoggedIn ? (
              <div className="w-full space-y-2">
                <Link href={dashboardUrl} className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-sm">dashboard</span>
                    Go to Dashboard
                  </button>
                </Link>
                <Link href={profileUrl} className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 border border-outline-variant/60 rounded-lg text-xs font-bold text-on-surface flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">person</span>
                    My Profile
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 border border-outline-variant rounded-lg text-xs font-bold text-on-surface">
                    Login
                  </button>
                </Link>
                <Link href="/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
