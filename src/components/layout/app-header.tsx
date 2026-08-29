"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGetMeQuery } from "@/services/auth-api";
import { useAppSelector } from "@/redux/hooks";
import { UserAvatar } from "@/components/ui/user-avatar";

export function AppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const reduxUser = useAppSelector((s) => s.auth.user);
  const { data, isLoading } = useGetMeQuery();
  const user = data?.user || reduxUser;
  const isLoggedIn = !!user;
  const isAdmin = (user as any)?.role === "admin" || (user as any)?.role === "superadmin";
  const dashboardUrl = isAdmin ? "/admin/dashboard" : "/user/dashboard";
  const profileUrl = isAdmin ? "/admin/profile" : "/user/profile";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Auction Room", href: "/notice-board" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin Panel", href: "/admin" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full h-20 bg-surface/80 glass-nav border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop max-w-container-max mx-auto h-full">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-9 w-9 object-contain" priority />
          <span className="text-xl md:text-headline-md font-headline-md font-extrabold text-primary tracking-tight">
            VKS AUTOSERVICES
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-unit-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label-md text-label-md transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1 font-semibold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardUrl}>
                <Button variant="primary" size="sm" className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  Dashboard
                </Button>
              </Link>
              <Link href={profileUrl} title="My Profile" className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
                <UserAvatar name={user?.name} image={user?.avatar} size="sm" />
              </Link>
            </div>
          ) : !isLoading ? (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-block">
                <Button variant="primary">Register</Button>
              </Link>
            </>
          ) : null}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/30 px-4 py-4 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-on-surface font-medium hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-outline-variant/20 flex gap-2">
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
